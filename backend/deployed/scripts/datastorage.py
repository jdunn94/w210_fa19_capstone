import json
import os

import boto3
from botocore.exceptions import ClientError


AWS_ACCESS = os.environ.get("AWS_ACCESS")
AWS_SECRET = os.environ.get("AWS_SECRET")
BUCKET = "mcai"


class AWSWriter:
    """Responsible for connecting to AWS S3 and reading/writing data"""
    def __init__(self):
        """Constructor for AWSWriter"""
        self.resource = boto3.resource("s3", aws_access_key_id=AWS_ACCESS, aws_secret_access_key=AWS_SECRET)
        self.bucket = BUCKET
        self.s3 = boto3.client("s3", aws_access_key_id=AWS_ACCESS, aws_secret_access_key=AWS_SECRET)

    def write_json(self, data, filename):
        """Exposed function for writing an object to S3"""
        object_exists = self.read_json(filename)
        if object_exists:
            # open the object and append the data to this list
            existing_data = json.loads(object_exists)
            existing_data.extend(json.loads(data))
            self.resource.Object(self.bucket, filename).put(Body=json.dumps(existing_data))
        else:
            # create the object and put it in S3
            object_ = self.resource.Object(self.bucket, filename)
            object_.put(Body=data)

    def read_json(self, filename):
        """Exposed function for reading an json object from S3"""
        object_ = self.resource.Object(self.bucket, filename)
        try:
            data = object_.get()["Body"].read().decode("utf-8")
            return data
        except ClientError as e:
            if e.response["Error"]["Code"] == "404" or e.response["Error"]["Code"] == "NoSuchKey":
                return False
            else:
                raise

    def write_model(self, data, filename):
        """Exposed function for writing model results to S3"""
        object_ = self.resource.Object(self.bucket, filename)
        object_.put(Body=data)

    def read_model(self, filename):
        """Exposed function for reading a model object from S3"""
        object_ = self.resource.Object(self.bucket, filename)
        try:
            data = object_.get()["Body"].read().decode("utf-8")
            return data
        except ClientError as e:
            if e.response["Error"]["Code"] == "404" or e.response["Error"]["Code"] == "NoSuchKey":
                return False
            else:
                raise

    def get_all_filenames(self, filepath):
        """Given a filepath to S3, return an iterable of all the filenames in that path"""
        keys = []
        kwargs = {"Bucket": self.bucket, 'Prefix': filepath}
        while True:
            resp = self.s3.list_objects_v2(**kwargs)
            for obj in resp['Contents']:
                keys.append(obj['Key'])
            try:
                kwargs['ContinuationToken'] = resp['NextContinuationToken']
            except KeyError:
                break
        return keys
