def main():
    from networkalgos import CommunityFinder, LeaderFinder
    from database import DatabaseManager

    # spin up models
    community_model = CommunityFinder()
    leader_model = LeaderFinder()

    models = [community_model, leader_model]

    # spin up neo4j database
    dbm = DatabaseManager()

    # import all data from neo4j development database
    full_db_pull = dbm.load_data_into_model("input_network")

    community_model.fit(full_db_pull)
    leader_model.fit(community_model.graph, community_model.community_labels)
    community_results = community_model.prepare_model_for_db_merge()
    dbm.merge_model_results(community_results, "output_network")


if __name__ == "__main__":
    main()
