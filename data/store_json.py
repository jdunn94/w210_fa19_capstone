import subprocess
import time

n=0

while True:
    subprocess.call('./bash.rc')
    print('Done for now!')
    time.sleep(14400)
    print('Restarting Batch Job for the ' + n + '!')
