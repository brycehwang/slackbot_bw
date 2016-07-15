"use strict";

var util = require("util"),
	path = require("path"),
	fs = require("fs"),
	SQLite = require("sqlite3").verbose(),
	Bot = require("slackbots");

var TimmyBot = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || "timmybot";
/*	this.dbPath = settings.dbPath || path.resolve(process.cwd(), "data", "norrisbot.db");
*/	this.user = null;
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
	this._loadRCInformation();
	this._loadStudentInformation(); //need to figure out how to write to a separate sqlite database
};

//loads RC information from database
TimmyBot.prototype._loadRCInformation = function(){
	//NEED TO IMPLEMENT
};

///loads student information from database
TimmyBot.prototype._loadStudentInformation = function(){
	//NEED TO IMPLEMENT
};

TimmyBot.prototype._loadBotUser = function(){
	var self = this;
	this.user = this.users.filter(function(user){
		return user.name == self.name;
	})[0];
}

TimmyBot.prototype._onMessage = function(message){
	var isChatMessage = this._isChatMessage(message), //boolean
		isChannelConversation = this._isChannelConversation(message), //boolean
		isFromTimmyBot = this._isFromTimmyBot(message),//boolean
		mentionsTimmyBot = this._isMentioningTimmyBot(message); //boolean

	if (isChatMessage && isChannelConversation && isFromTimmyBot && mentionsTimmyBot){
		var userType = this._determineUserType(message); //returns student, RC, random
		if (userType == "student"){
			this._studentActions(message);
		} else if(userType =="RC"){
			this._RCActions(message);
		}
	}
	//need a time based listener too to resetn location in the morning?
};

//return boolean- true if is a chat message
TimmyBot.prototype._isChatMessage = function(message){
	return message.type == "message" && Boolean(message.text);
};

//returns boolean - true if the conversation is in the current channel
TimmyBot.prototype._isChannelConversation = function(message){
	/*console.log(typeof message.channel)
	console.log(message.channel)*/
	return typeof message.channel === 'string' &&
		message.channel[0] === 'C';
};

//returns boolean - true if is from Timmybot
TimmyBot.prototype._isFromTimmyBot = function(message){
	return message.user === this.user.id;
};

//returns boolen - true if is directed at timmybot
TimmyBot.prototype._isMentioningTimmyBot = function(message){}
	/*return message.text.toLowerCase().indexOf('timmybot') > -1 ||
		message.text.indexOf(this.user.id) > -1; */
	return message.text.indexOf(this.user.id) > -1;
};

TimmyBot.prototype._determineUserType = function(message){
	var userID = message.user;
	if (userID in this.RCList){//NEED to figure out way to check if in dict
		return "RC";
	} else if (userID in this.studentList){ //NEED to figure out wya to chekc if in dict
		return "student";
	} else{
		return "random";
	}
};

TimmyBot.prototype._studentActions = function(message){
	var userType = "student",
		userID = message.user,
		isCheckingInOrOut = this._isCheckingInOrOut(message, userType),
		isCorrectUserForCheckin = this._isCorrectUserForCheckin(message),
		isWantingRCInformation = this._isWantingRCInformation(message, userType);

	if (isCheckingInOrOut){
		if (isCorrectUserForCheckin){

		} else{
			var failMessage = "Please make sure you use 'checkin <location>' and are checking in only for yourself. Thanks!"
			self.postMessageToUser(userID, failMessage, {as_user: true});
		}
	} else if (isWantingRCInformation)
	//check if  checking in
	//check if want RC information
};

TimmyBot.prototype._RCActions = function(message){
	var userType = "RC";
	//check if check in
	//check if want rc information
	//check if want studnet information
	//check if  want student inoformation
};

//boolean - true if is in format "checkin <location>""
TimmyBot.prototype._isCheckingInOrOut = function(message, userType){

};

//ensures only person with correct id can check in or out
//boolean - true if is correct format
TimmyBot.prototype._isCorrectUserForCheckin = function(message){

}

//boolean - true if it correct
TimmyBot.prototype._isWantingRCInformation = function(message, userType){

};