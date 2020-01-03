"""
Top level functionality for building and maintaining database
"""
import operator

from constants import SEARCH_TOPICS
from database import DatabaseManager
from datastorage import AWSWriter
from locationalgo import LocationPropagator
from networkalgos import CommunityFinder, CenterFinder
from profilebuilder import ProfileBuilder
from tweets import UserTimelineGetter, RetweetFullTextGetter


PERSONA_RULES = {
    "TWEETED->RETWEETED": "thought_leader",
    "TWEETED->None": "content_creator",
    "RETWEETED->TWEETED": "amplifier",
    "TWEETED->MENTIONS": "watchdog",
}

PERSONAS = ["thought_leader", "content_creator", "amplifier", "watchdog"]


class Capstone:
    """Capstone is responsible for each step in the end-to-end construction and maintainence of our database"""
    def __init__(self):
        """Constructor for Capstone object"""
        # connect to AWS and database
        self.dbm = DatabaseManager()
        self.aws_writer = AWSWriter()
        self.user_limit = 200

    def destroy_database(self):
        """Tear down whatever is currently in production database"""
        self.dbm.destroy_production_database()

    def load_new_tweets(self):
        """Load new tweets from AWS into the development database"""
        for topic in SEARCH_TOPICS:
            print(f"Loading tweets for {topic} into dev database")
            self.dbm.load_new_tweets(topic, recent=False)
            self.dbm.ensure_topic_node(topic)

    def run_info_map(self):
        """Apply info map on the development dataset to identify communities"""
        print(f"Applying InfoMap to entire graph")
        community_model = CommunityFinder(topic="full_graph")
        center_model = CenterFinder()
        topic_data = self.dbm.load_data_into_model(topic=None, persona_query=None, full_graph=True)
        community_model.fit(topic_data)
        center_model.fit(community_model.graph, community_model.community_labels)
        community_results = community_model.prepare_model_for_db_merge3()
        self.dbm.merge_model_results(community_results, "output_network")

    def migrate_dev_to_prod(self):
        """Migrate community center users to the production database"""
        users_to_migrate = self.dbm.run_script(self.dbm.prod_driver,
                                               "./etl_queries/export_prod_users_without_tweets.cypher",
                                               get_values=True)
        users_to_migrate = [x["u.id"] for x in users_to_migrate]
        self.pull_user_timelines(users_to_migrate)
        self.dbm.migrate_dev_to_prod([int(user) for user in users_to_migrate])
        self.evaluate_user_personas(users_to_migrate)

    def pull_user_timelines(self, users_to_migrate):
        """Pull user timelines for user profile generation"""
        users_pulled = list()
        user_limit = self.user_limit
        for user in users_to_migrate:
            if user_limit > 0:
                if self.aws_writer.read_json(f"{user}.json"):
                    continue
                else:
                    UserTimelineGetter(user).get_user_timeline()
                    user_limit -= 1
                    users_pulled.append(user)
            else:
                break

    def get_user_behavior(self, user):
        """Pull a user's first degree connections and compute the count of relationship types"""
        export_args = {"users_to_migrate": [user]}
        results = self.dbm.run_script(self.dbm.dev_driver,
                                      "./etl_queries/export_migration_users_and_topics.cypher",
                                      args=export_args, get_values=True)
        user_topics = list(set([x['t.name'] for x in results.data()]))
        user_topic_stats = dict()
        for topic in user_topics:
            results = self.dbm.run_script(self.dbm.dev_driver,
                                          "./etl_queries/export_first_degree_connections.cypher",
                                          args={"user_id": user, "search_term": topic}, get_values=True, verbose=False)
            results = [record for record in results.values()]
            if results:
                relationships = [str(line[0]) + "->" + str(line[1]) for line in results]
                rel_counts = {
                    "TWEETED->RETWEETED": 0,
                    "TWEETED->None": 0,
                    "RETWEETED->TWEETED": 0,
                    "TWEETED->MENTIONS": 0,
                }
                for rel in relationships:
                    if rel == "RETWEETED->RETWEETED" or rel == "RETWEETED->MENTIONS":
                        rel = "RETWEETED->TWEETED"
                    if rel not in rel_counts:
                        continue
                    rel_counts[rel] += 1
                user_topic_stats[topic] = rel_counts
        return user_topic_stats

    def evaluate_user_personas(self, users_to_migrate):
        """Generate persona roles for user nodes based on their twitter behavior"""
        user_rel_stats = dict()
        for user in users_to_migrate:
            user_rel_stats[user] = self.get_user_behavior(user)

        user_personas = list()
        for topic in SEARCH_TOPICS:
            # first, normalize all stats as percentage of relationships
            topic_subset = {user_id: topic_counts[topic] for user_id, topic_counts in user_rel_stats.items() if
                            topic in
                            topic_counts}

            for user_id, rel_counts in topic_subset.items():
                sum_rel = sum(rel_counts.values())
                if sum_rel == 0:
                    continue
                topic_subset[user_id] = {rel: count / sum_rel for rel, count in rel_counts.items()}

            num_users = len(topic_subset)
            # first, get the watchdogs as the top 25% of mentions and remove them from consideration
            topic_mentions = {user_id: topic_subset[user_id]["TWEETED->MENTIONS"] for user_id in topic_subset}
            watchdogs = sorted(topic_mentions.items(), key=operator.itemgetter(1), reverse=True)[
                        :int(num_users * 0.25)]
            for user_id, score in watchdogs:
                user_personas.append({"user_id": user_id, "persona": "watchdog", "search_term": topic})
            # remove watchdogs from remaining group
            topic_subset = {k: v for k, v in topic_subset.items() if k not in watchdogs}

            # second, get the amplifiers as the top 25% of retweets and remove them from consideration
            topic_retweets = {user_id: topic_subset[user_id]["RETWEETED->TWEETED"] for user_id in topic_subset}
            amplifiers = sorted(topic_retweets.items(), key=operator.itemgetter(1), reverse=True)[
                         :int(num_users * 0.25)]
            for user_id, score in amplifiers:
                user_personas.append({"user_id": user_id, "persona": "amplifier", "search_term": topic})
            # remove amplifiers from remaining group
            topic_subset = {k: v for k, v in topic_subset.items() if k not in amplifiers}

            # third, get the content creators as the top 25% of tweets and remove them from consideration
            topic_content = {user_id: topic_subset[user_id]["TWEETED->None"] for user_id in topic_subset}
            content_creators = sorted(topic_content.items(), key=operator.itemgetter(1), reverse=True)[:int(num_users *
                                                                                                            0.25)]
            for user_id, score in content_creators:
                user_personas.append({"user_id": user_id, "persona": "content_creator", "search_term": topic})

        self.dbm.run_script(self.dbm.prod_driver, "./etl_queries/import_user_personas.cypher",
                       args={"user_persona_list": user_personas}, verbose=True)

    def build_user_profiles(self):
        """Build user profiles using user tweet histories"""
        for topic in SEARCH_TOPICS:
            print(f"Generating user profiles for users who tweet about {topic}")
            for persona in PERSONAS:
                pb = ProfileBuilder(topic, persona, ignore_sentiment=True)
                any_profiles = pb.build_user_profiles2()  # catch any False tag that is thrown
                any_profiles = pb.build_user_profiles3()  # catch any False tag that is thrown
            self.dbm.run_script(self.dbm.prod_driver, "./etl_queries/compute_relative_statistics.cypher",
                           args={"search_term": topic},
                           verbose=True)

    def fill_truncated_retweets(self):
        """Fetch full tweet text for retweets which come in truncated"""
        def divide_chunks(l, n):
            # looping till length l
            for i in range(0, len(l), n):
                yield l[i:i + n]

        results = self.dbm.run_script(self.dbm.prod_driver, "./etl_queries/get_retweet_truncated_text.cypher",
                                    get_values=True)
        tweet_ids = [record[0] for record in results]
        full_text_map = dict()
        if len(tweet_ids) > 100:
            batch_size = 100
            batch_list = list(divide_chunks(tweet_ids, batch_size))
            for batch in batch_list:
                rftg = RetweetFullTextGetter(batch)
                full_text_map.update(rftg.get_tweet_full_text())
        else:
            rftg = RetweetFullTextGetter(tweet_ids)
            full_text_map = rftg.get_tweet_full_text()

        tweets_with_text = [{"id": k, "text": v} for k, v in full_text_map.items()]
        args = {"tweets_with_text": tweets_with_text}
        self.dbm.run_script(self.dbm.prod_driver, "./etl_queries/import_retweet_full_text.cypher",
                            args=args, verbose=True)

    @staticmethod
    def impute_user_locations():
        """Predict a user's location based on their immediate network of followers"""
        location_model = LocationPropagator(topic="homeless")
        location_model.impute_location()

    def clean_up(self):
        """Delete the tweets about relationship where there is no tweets that match"""
        self.dbm.run_script(self.dbm.prod_driver, "./etl_queries/clean_up.cypher", verbose=True)

    def end_to_end(self):
        self.destroy_database()
        self.load_new_tweets()
        self.run_info_map()
        self.migrate_dev_to_prod()
        self.pull_user_timelines()
        self.get_user_behavior()
        self.build_user_profiles()
        self.fill_truncated_retweets()
        self.impute_user_locations()
        self.clean_up()


if __name__ == "__main__":
    # run the project end-to-end when this entire module is called
    capstone = Capstone()
    capstone.end_to_end()
