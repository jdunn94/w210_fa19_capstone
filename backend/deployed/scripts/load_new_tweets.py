SEARCH_TOPICS = ["homeless", "lgbt", "education"]


def main():
    from database import DatabaseManager
    dbm = DatabaseManager()
    for topic in SEARCH_TOPICS:
        dbm.load_new_tweets(topic)


if __name__ == "__main__":
    main()
