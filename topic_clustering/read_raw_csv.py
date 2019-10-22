# Read raw tweets.csv database dump into a dataframe and save into training
# format, i.e., 'id,text,class'
import datetime
import hashlib
import os
import pandas as pd
import sys
import unicodedata

if len(sys.argv) < 2:
    raise Exception('{} filename.csv.'.format(sys.argv[0]))

CSV_FILENAME = sys.argv[1]

print('Read raw csv file: ', CSV_FILENAME)

# "t.id","urls","t.truncated","t.created_at","t.favorite_count","text","t.retweet_count"1182636585055150000,"   https://themindunleashed.com/2018/10/homeless-man-becomes-millionaire-by-building-beaches-in-peoples-backyards.html",false,"Fri Oct 11 12:38:28 +0000 2019",0,"Love this story. It would make for a great story on the silver screen. https://t.co/AcSIO69avq",0

data = pd.read_csv(CSV_FILENAME,
                   dtype={
                       't.id': str,
                       'urls': str,
                       't.truncate': bool,
                       't.created_at': str,
                       't.favorite_count': float,
                       'text': str,
                       't.retweet_count': float},
                   skip_blank_lines=True,
                   header=0,
                   verbose=True)

data = data.fillna({
    't.id': data['t.id'].ffill(),
    'text': data['text'].ffill(),
})

# 5814b8a3e9f3b453dcf342c6b4210e37fefc03bc,RT @astroehlein: Im not gay.
# Im not Muslim     .   Im not a senior.   Im not Hungarian.   Im not
# trans.   Im not black.   Im not a r     efu,News
tweets = set()  # remove duplicate tweets

df = pd.DataFrame(columns=['id', 'text', 'class'])

for index, row in data.iterrows():
    # print(row)
    # print(len(row))
    s = row['text']
    # print(s)
    if s.startswith('RE: '):
        #print('A RE tweet, ignore:', s)
        continue
    s = s.replace(',', ' ')
    s = s.encode('ascii', 'ignore').decode('ascii').strip()
    # print(s)
    id = hashlib.md5(s.encode('utf-8')).hexdigest()
    if id in tweets:
        #print('Duplicate tweet, ignore:', id)
        continue
    tweets.add(id)
    df.loc[index] = [row['t.id'], s, 'Homeless']
    if index % 5000== 0:
        print('Processed: ', index)

print(df.head())

d = datetime.date.today()
OUTPUT_FILENAME = os.path.join(
    'data', 'csv', 'out_training_data_{}.csv'.format(
        d.strftime('%m_%d_%H_%M_%S')))
df.to_csv(OUTPUT_FILENAME)
print('Write to file: ', OUTPUT_FILENAME, ', size=', df.shape)
