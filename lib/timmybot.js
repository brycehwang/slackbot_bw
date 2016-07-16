"use strict";

var util = require("util"),
	path = require("path"),
	fs = require("fs"),
	SQLite = require("sqlite3").verbose(),
	Bot = require("slackbots");

var TimmyBot = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || "timmy";
	this.dbPath = settings.dbPath || path.resolve(process.cwd(), "data", "norrisbot.db");
	this.user = null;
	this.db = null;

};

util.inherits(TimmyBot, Bot);

module.exports = TimmyBot;

TimmyBot.prototype.run = function(){
	var self = this;
	TimmyBot.super_.call(this, this.settings);

	this.on("start", this._onStart);
	this.on("message", this._onMessage);
};

TimmyBot.prototype._onStart = function(){
	this._loadBotUser();
	this._connectDB();
};

TimmyBot.prototype._connectDB = function(){
	var exists = fs.existsSync(this.dbPath);
	console.log(exists)
	if(!exists) {
	  console.log("Creating DB file.");
	  fs.openSync(this.dbPath, "w");
	}
	this.db = new sqlite3.Database(this.dbPath);
	console.log(this.db)
	this.db.serialize(function(){
		this.db.run("CREATE TABLE if not exists information (name TEXT PRIMARY KEY NOT NULL, userid TEXT NOT NULL, persontype TEXT NOT NULL, location TEXT)");
		this.db.get('SELECT userid FROM information WHERE userid = "5" LIMIT 1', function(err, record){
			console.log(record)
		});
	}); 
};

TimmyBot.prototype._loadBotUser = function(){
	var self = this;
	this.user = this.users.filter(function(user){
		return user.name == self.name;
	})[0];
}

TimmyBot.prototype._onMessage = function(message){
	if (this._isChatMessage(message) && this._isChannelConversation(message) && !this._isFromTimmyBot(message) && this._isMentioningTimmyBot(message)){
		var userType = this._determineUserType(message); //returns student, RC, random
		if (userType == "student"){
			this._studentActions(message);
		} else if(userType =="RC"){
			this._RCActions(message);
		}
	}
};

//return boolean- true if is a chat message
TimmyBot.prototype._isChatMessage = function(message){
	return message.type == "message" && Boolean(message.text);
};

//returns boolean - true if the conversation is in the current channel
TimmyBot.prototype._isChannelConversation = function(message){
	return typeof message.channel === 'string' &&
		message.channel[0] === 'C';
};

//returns boolean - true if is from Timmybot
TimmyBot.prototype._isFromTimmyBot = function(message){
	return message.user === this.user.id;
};

//returns boolen - true if is directed at timmybot
TimmyBot.prototype._isMentioningTimmyBot = function(message){
	return message.text.indexOf(this.user.id) > -1;
};

TimmyBot.prototype._determineUserType = function(message){
	var self = this;
	var ok = "ok"
	console.log(ok)
	var RCList = self.db.get("SELECT userid FROM information WHERE persontype = 'RC'")
	console.log(ok)
	var studentList = self.db.get("SELECT userid FROM information WHERE persontype = 'student'")
	var userID = message.user;
	if (userID in RCList){//NEED to figure out way to check if in dict
		return "RC";
	} else if (userID in studentList){ //NEED to figure out wya to chekc if in dict
		return "student";
	} else{
		return "random";
	}
};

TimmyBot.prototype._studentActions = function(message){
	var userType = "student",
		userID = message.user,
		isCheckingInOrOut = this._isCheckingInOrOut(message),
		isWantingRCInformation = this._isWantingRCInformation(message);

	if (isCheckingInOrOut){
		var checkinInfo = this._checkinInfo(message);
		if (checkinInfo != "failed"){
			self.db.get('SELECT userid FROM information WHERE userid =' + userID, function(err, record){
				if(err){
					return console.error("DATABASE ERROR", err);
				}
				self.db.run('UPDATE information SET location = ? WHERE name = ' + userID, checkinInfo);
			});

			if (!record){
				self._nameFinder();
				return self.db.run('INSERT INTO info(ID, name, userid, persontype, location) VALUES(NULL, "joe", ?, "student", ?)', (userID, checkinInfo));
			}
			var successMessage= "Successfully checked in to " + checkinInfo;
			self.postMessageToUser(userID, successMessage, {as_user: true});
		}
	}

	if (isWantingRCInformation){
		var rcinfo = self.db.get("SELECT location FROM information WHERE persontype = 'RC'")
		var rcInfoFormatted = rcinfo;
		self.postMessageToUser(userID, rcInfoFormatted, {as_user: true});
	}
};

TimmyBot.prototype._RCActions = function(message){
	var userType = "RC",
		userID = message.user,
		isCheckingInOrOut = this._isCheckingInOrOut(message),
		isWantingRCInformation = this._isWantingRCInformation(message),
		isWantingStudentInformation = this._isWantingStudentInformation(message);

	if (isCheckingInOrOut){
		var checkinInfo = this._checkinInfo(message);
		if (checkinInfo != "failed"){
			self.db.get('SELECT userid FROM information WHERE userid =' + userID, function(err, record){
				if(err){
					return console.error("DATABASE ERROR", err);
				}
				self.db.run('UPDATE information SET location = ? WHERE name = ' + userID, checkinInfo);
			});

			if (!record){
				self._nameFinder();
				return self.db.run('INSERT INTO info(ID, name, userid, persontype, location) VALUES(NULL, "joe", ?, "student", ?)', (userID, checkinInfo));
			}
			var successMessage= "Successfully checked in to " + checkinInfo;
			self.postMessageToUser(userID, successMessage, {as_user: true});
		}
	}

	if (isWantingRCInformation){
		var rcinfo = self.db.get("SELECT location FROM information WHERE persontype = 'RC'")
		var rcInfoFormatted = rcinfo;
		self.postMessageToUser(userID, rcInfoFormatted, {as_user: true});
	}

	if (isWantingStudentInformation){
		var studentinfo = self.db.get("SELECT location FROM information WHERE persontype = 'student'")
		self.postMessageToUser(userID, studentInfoFormatted, {as_user: true});
	}
};

TimmyBot.prototype._checkinInfo = function(message){
	try{
		return message.text.substring(message.text.indexOf("checkin") + 8, message.text.length);
	} catch(err){
		var failMessage = "Please make sure you use 'checkin <location>'"
		self.postMessageToUser(userID, failMessage, {as_user: true});
		return false;
	}
};

//boolean - true if is in format "checkin <location>""
TimmyBot.prototype._isCheckingInOrOut = function(message){
	return message.text.indexOf("checkin") > -1;
};

//boolean - true if it correct
TimmyBot.prototype._isWantingRCInformation = function(message, userType){
	return message.text.indexOf("rcinfo") > -1;
};

//boolean - true if it is correct
TimmyBot.prototype._isWantingStudentInformation = function(message){
	return message.text.indexOf("studentInfo") > -1;
};