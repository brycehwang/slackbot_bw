'use strict';

var botType = "dffdfd"

if (botType == "norris"){
	var NorrisBot = require('../lib/norrisbot');

	var token = "", //token for norrisbot
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
	var token = "",//insert API token here
		dbPath = process.env.BOT_DB_PATH,
		name = process.env.BOT_NAME;

	var timmybot = new TimmyBot({
		token: token,
		name: name
	});
	timmybot.run();
}