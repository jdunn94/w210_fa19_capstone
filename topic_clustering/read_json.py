import hashlib
import json
import os
import re
import sys

from os import walk

files = []
for (dirpath, dirnames, filenames) in walk(sys.argv[1]):
    files.extend(filenames)

print('Read files:', len(files))

OUTPUT_FILENAME = 'our_training_10_15.csv'

write_file = open(OUTPUT_FILENAME, 'w')
write_file.write(',text,class\n')

# remove duplicates
hash_file_ids = set()
duplicates = 0

for fname in files:
    fullname = os.path.join(sys.argv[1], fname)
    with open(fullname) as json_file:
        try:
            data = json.load(json_file)
        except BaseException:
            print('Incorrect json file:', fullname)
            continue
        for p in data['statuses']:
            tweet = p['text']
            s = tweet.encode('ascii', 'ignore').decode('ascii').strip()
            if not s or re.match(r'^\s*$', s):
                continue
            cleaned = s.rstrip('\r\n').replace('\n', ' ')
            cleaned = cleaned.replace(',', ' ')
            #print(cleaned + "\n")
            hash_object = hashlib.sha1(cleaned.encode()).hexdigest()
            if hash_object in hash_file_ids:
                duplicates = duplicates + 1
                print('Found duplicates:', hash_object)
                continue
            hash_file_ids.add(hash_object)
            write_file.write('{},{},News\n'.format(hash_object, cleaned))

        print('Proccessed:', fname)

write_file.close()
print("\r\n*********write tweets to tweets.txt, duplicates: ", duplicates,
      "*********")
