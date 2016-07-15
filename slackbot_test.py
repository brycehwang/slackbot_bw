from slackclient import SlackClient
import time
token = "xoxp-55867697045-59891677699-59984765313-b81712b3fa"
token_bot = "xoxb-59983757393-b7f7wByvAmckMDwm7G27sYn6"
sc = SlackClient(token_bot)
print (sc.api_call("api.test"))
# print (sc.api_call("channels.info", channel = "testbotchannel"))
chan="testbotchannel"
greeting="Hello!\nNice to meet you."
print (sc.api_call("chat.postMessage", as_user="true:", channel=chan, text=greeting))

chan = "G1RT7SRMH"
names = ["hannah", "alicia", "jenny", "cindy", "bryce"]
peopleDict = {}
class People(object):
	def __init__(self, name, location):
		self.location = location
		self.name = name

	def get_name(self):
		return self.name

	def get_location(self):
		return self.name

	def set_location(self, new_location):
		self.location = new_location

for name in names:
	peopleDict[name] = People(name, "dorm6")

print(peopleDict["bryce"].location)

count = 0
if sc.rtm_connect():
	while count < 10:
		count += 1
		# print (sc.rtm_read())
		# user_text=sc.api_call("im.history")
		user_text = sc.rtm_read()
		content = []
		if user_text != []:
			try:
				content = user_text[0]["text"].split(" ")
				print (content)
				if len(content) == 2:
					name = content[0]
					location = content[1]
					peopleDict[name].set_location(location)
				else:
					print (sc.api_call("chat.postMessage", as_user = "true:", channel = chan, text = "Sorry Didn't recognize that user"))

			except:
				content = []
		time.sleep(1)
else:
	print ("connnection failed")
print ([peopleDict[x].name + " , " + peopleDict[x].location for x in names])

# if sc.rtm_connect():
# 	while True:
# 		print (sc.rtm_read())
# 		time.sleep(1)
# 		break
# else:
# 	print ("connection failed, invalid token?")
chan = "testbotchannel"
# print (sc.api_call("im.history", channel=chan))
# print (sc.server)