'use strict';

var botType = "dffdfd"

if (botType == "norris"){
	var NorrisBot = require('../lib/norrisbot');

	var token = "xoxb-60007126743-mlEifU3XgNu3SXWwL1RpdSeV", //token for norrisbot
		dbPath = process.env.BOT_DB_PATH,
		name = process.env.BOT_NAME;

	var norrisbot = new NorrisBot({
		token: token,
		dbPath: dbPath,
		name: name
	});
	norrisbot.run();
} else{
	var TimmyBot = require('../lib/timmybot');
	var token = "xoxb-59983757393-b7f7wByvAmckMDwm7G27sYn6",//insert API token here
		dbPath = process.env.BOT_DB_PATH,
		name = process.env.BOT_NAME;

	var timmybot = new TimmyBot({
		token: token,
		name: name
	});
	timmybot.run();
}