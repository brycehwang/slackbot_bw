"use strict";

var util = require("util"),
	path = require("path"),
	fs = require("fs"),
	SQLite = require("sqlite3").verbose(),
	Bot = require("slackbots");

var NorrisBot = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || "norrisbot";
	this.dbPath = settings.dbPath || path.resolve(process.cwd(), "data", "norrisbot.db");
	this.user = null;
	this.db = null;
};

util.inherits(NorrisBot, Bot);

module.exports = NorrisBot;

NorrisBot.prototype.run = function(){
	var self = this;
	NorrisBot.super_.call(this, this.settings);

	this.on("start", this._onStart);
	this.on("message", this._onMessage);
};

NorrisBot.prototype._onStart = function(){
	this._loadBotUser();
	this._connectDB();
	this._firstRunCheck();
};

NorrisBot.prototype._loadBotUser = function(){
	var self = this;
	this.user = this.users.filter(function(user){
		return user.name == self.name;
	})[0];
};

NorrisBot.prototype._connectDB = function(){
	if(!fs.existsSync(this.dbPath)){
		console.error('DB path ' + this.dbPath + " does not exist or did not load.");
		process.exit(1);
	}
	this.db = new SQLite.Database(this.dbPath);
};

NorrisBot.prototype._firstRunCheck = function(){
	var self = this;
	self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function(err, record){
		if(err){
			return console.error("DATABASE ERROR", err);
		}

		var currentTime = (new Date()).toJSON();

		if (!record){
			self._welcomeMessage();
			return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
		}

		self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
	})
};

NorrisBot.prototype._welcomeMessage = function(){
	this.postMessageToChannel(this.channels[0].name, "Hello!", {as_user: true});
};

NorrisBot.prototype._onMessage = function(message){
	if(this._isChatMessage(message) &&
		this._isChannelConversation(message) &&
		!this._isFromNorrisBot(message) &&
		this._isMentioningChuckNorris(message)){
		console.log("hurrah")
		this._replyWithRandomJoke(message);
	}
};

NorrisBot.prototype._isChatMessage = function(message){
	return message.type == "message" && Boolean(message.text);
};

NorrisBot.prototype._isChannelConversation = function(message){
	/*console.log(typeof message.channel)
	console.log(message.channel)*/
	return typeof message.channel === 'string' &&
		message.channel[0] === 'C';
};

NorrisBot.prototype._isFromNorrisBot = function(message){
	return message.user === this.user.id;
};

NorrisBot.prototype._isMentioningChuckNorris = function(message){
	return message.text.toLowerCase().indexOf('chuck norris') > -1 ||
		message.text.toLowerCase().indexOf("U1S073QMV") > -1; //temp workaround
};

NorrisBot.prototype._replyWithRandomJoke = function(originalMessage){
	var self = this;
	self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function(err, record){
		if (err){
			return console.error('DATABASE ERROR:', err);
		}

		var channel = self._getChannelByID(originalMessage.channel);
		self.postMessageToChannel(channel.name, record.joke, {as_user: true});
		self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
	});
};

NorrisBot.prototype._getChannelByID = function(channelId){
	return this.channels.filter(function(item){
		return item.id === channelId;
	})[0];
};