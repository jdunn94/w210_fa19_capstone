SEARCH_TOPICS = ["homeless", "lgbt", "education"]


def main():
    from tweets import TweetSearcher
    for topic in SEARCH_TOPICS:
        TweetSearcher(topic).get_search_tweets()


if __name__ == "__main__":
    main()
