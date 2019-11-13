USER_TIMELINE_PATH = "data/user_timelines"


def main():
    from database import DatabaseManager
    from datastorage import AWSWriter
    aws_writer = AWSWriter()
    dbm = DatabaseManager()
    user_timeline_files = aws_writer.get_all_filenames(USER_TIMELINE_PATH)
    for filename in user_timeline_files:
        if filename == USER_TIMELINE_PATH:
            continue
        dbm.load_new_user_timeline(filename)


if __name__ == "__main__":
    main()
