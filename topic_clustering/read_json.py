import json
import re
import sys

write_file = open('tweets.txt', 'w')
with open(sys.argv[1]) as json_file:
  data = json.load(json_file)
  for p in data['statuses']:
    tweet = p['text']
    s = tweet.encode('ascii', 'ignore').decode('ascii').strip()
    if not s or re.match(r'^\s*$', s):
      continue
    print(s + "\n")
    write_file.write(s + "\n")
write_file.close()
print("\r\n*********write tweets to tweets.txt**********")


