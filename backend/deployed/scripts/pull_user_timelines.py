# TODO: Create a function that crawls the models folder for persona.txt files
QUEUED_USER_PATH = "models/leaders.txt"


def main():
    import ast

    from datastorage import AWSWriter
    from tweets import UserTimelineGetter
    aws_writer = AWSWriter()
    users_to_pull = ast.literal_eval(aws_writer.read_model(QUEUED_USER_PATH))
    for user in users_to_pull:
        if aws_writer.read_json(f"{user}.json"):
            continue
        else:
            UserTimelineGetter(user).get_user_timeline()


if __name__ == "__main__":
    main()
