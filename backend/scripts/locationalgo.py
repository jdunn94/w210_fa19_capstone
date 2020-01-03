import os


from scipy.stats import mode

from database import DatabaseManager
from tweets import UserFollowerGetter


ETL_QUERIES_PATH = "./etl_queries"


class LocationPropagator:
    """Responsible for imputing a Twitter user's location for users who have not enabled theirs"""
    def __init__(self, topic):
        self.dbm = DatabaseManager()
        self.topic = topic

    @staticmethod
    def divide_chunks(l, n):
        """Batching function"""
        for i in range(0, len(l), n):
            yield l[i:i + n]

    def _get_nolocation_users(self):
        args = {"search_term": self.topic}
        results = self.dbm.run_script(self.dbm.prod_driver,
                                      os.path.join(ETL_QUERIES_PATH, "export_nolocation_users.cypher"),
                                      args=args,
                                      get_values=True)
        return [x[0] for x in results]

    def _pull_user_followers(self, user):
        ufg = UserFollowerGetter(user)
        follower_location_pairs = ufg.get_user_followers()
        return [x[1] for x in follower_location_pairs if x[1] not in [None, ""]]

    def _impute_batch_user_location(self, users_to_pull, batch_size=5):
        """Putting the write stage after certain number of batch users are pulled to get some data written"""
        batch_users_to_pull = list(self.divide_chunks(users_to_pull, batch_size))
        for batch in batch_users_to_pull:
            imputed_user_locations = list()
            for user in batch:
                follower_locations = self._pull_user_followers(user)
                mode_location = mode(follower_locations)[0][0]
                imputed_user_locations.append([user, mode_location])
            location_batch_args = {"user_locations": imputed_user_locations}
            self.dbm.run_script(self.dbm.prod_driver,
                                os.path.join(ETL_QUERIES_PATH, "import_imputed_location_users.cypher"),
                                args=location_batch_args, verbose=True)

    def impute_location(self):
        """Exposed method for imputing a users location based on their friends location"""
        users_to_pull = self._get_nolocation_users()
        self._impute_batch_user_location(users_to_pull)


