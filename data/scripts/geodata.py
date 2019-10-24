import requests
import csv
import os
import json

url = "https://api.twitter.com/1.1/search/tweets.json"

params = {
    "count": 200,
    "result_type": "recent",
    "lang": "en",
    "tweet_mode":"extended"
}

headers = {}

data_folder = "tweet_location_files"
location_file = "msa.csv"
tweet_file = "locations.json"
secrets_file = "secrets.json"

print(f"Opening secrets file: {os.path.join(data_folder,secrets_file)}")
if os.path.exists(os.path.join(data_folder,secrets_file)):
    print("File found")
    with open(os.path.join(data_folder,secrets_file)) as json_file:
        j = json.load(json_file)
        headers.update({k:v for (k,v) in j.items() if k == "Authorization"})
    print("Secrets file loaded")
else:
    print("File not found")

locations = {}

with open(os.path.join(data_folder,location_file)) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count > 0:
            if row[2] != "":
                locations[row[1]] = {"geocode":row[2]+",15mi","since_id":0, "statuses": {}}
        line_count += 1

print(f"Locations found: len(locations)")

print(f"Checking for existing tweet file: {os.path.join(data_folder,tweet_file)}")
if os.path.exists(os.path.join(data_folder,tweet_file)):
    print("File found")
    with open(os.path.join(data_folder,tweet_file)) as json_file:
        j = json.load(json_file)
        locations.update(j)
    print("Tweet file loaded")
else:
    print("File not found")

for loc in locations.keys():
    query = {**params, **{k:v for (k,v) in locations[loc].items() if k != "statuses"}}
    print(f"Getting {loc}")
    r = requests.get(url, headers=headers, params=query)
    if r.status_code == 200:
        new_statuses = {s["id"]:{k:v for (k,v) in s.items() if k in ("created_at","geo","coordinates","place","user","entities")} for s in r.json()["statuses"]}
        for status in new_statuses.keys():
            new_statuses[status]["user"] = {k:v for (k,v) in new_statuses[status]["user"].items() if k in ("id", "name", "screen_name", "description", "location","created_at", "utc_offset","time_zone")}
            new_statuses[status]["hashtags"] = [ht["text"] for ht in new_statuses[status]["entities"]["hashtags"]]
            new_statuses[status].pop("entities")
        old_length = len(locations[loc]["statuses"])
        locations[loc]["statuses"] = {**locations[loc]["statuses"], **new_statuses}
        new_length = len(locations[loc]["statuses"])
        new_since = max([int(x) for x in new_statuses.keys()])
        locations[loc]["since_id"] = new_since
        print(f"Added {new_length - old_length} statuses")
    else:
        print(f"Failed GET")

print(f"Saving {os.path.join(data_folder,tweet_file)}")

with open(os.path.join(data_folder,tweet_file), 'w') as f:
    json.dump(locations, f)