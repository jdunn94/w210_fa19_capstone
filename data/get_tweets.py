#upload_tweets('mic-check-ai-tweets', 'Twitter_Search_Function.txt', 'Twitter_Search_Function.txt' )
def write_json(file_name,input_data):
    "Take json data & write it directly to a file_name"
    import json
    with open(file_name, 'w', encoding='utf-8') as f:
       json.dumps(json.dump(input_data, f, ensure_ascii=False, indent=4))

import tweepy
import time
#Initialize_Counter
n = 31726 
while True:
    auth = tweepy.OAuthHandler("fkKsILSdC8oRchfswSVfo0ZB6", "v8EigkSWeKv36nGF83KXm6YkisFoOcrykK2fEEbSWugJQx06Ux")
    auth.set_access_token("2257754240-nmosIVlMPNuMFUTBp7bdXPO9P4hPPchTSuXNH03", "VqerC7XGivanazVVROXmXepPluu0jHzoWNnvHMYkkb0lT")
    api = tweepy.API(auth, parser=tweepy.parsers.JSONParser())
    results = api.search('homeless',tweet_mode='extended')
    n+=1
    write_json('json_results/data' + str(n) + '.json', results)
    print('It worked' + str(n) + '!')
    time.sleep(5)
