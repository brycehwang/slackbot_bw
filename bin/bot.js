'use strict';

var NorrisBot = require('../lib/norrisbot');

var token = "xoxb-60007126743-bbz5YEbPmCsBeGMi3YkKSRIa", //token for norrisbot
	dbPath = process.env.BOT_DB_PATH,
	name = process.env.BOT_NAME;

var norrisbot = new NorrisBot({
	token: token,
	dbPath: dbPath,
	name: name
});

norrisbot.run();