'use strict';

const express = require('express');
const mongoose = require('mongoose');
const asyncjs = require('async');

const utils = require('../utils');
const dayLib = require('../day');

const DayModel = require('../../models/day');
const timeToGetFromAtoBModel = require('../../models/ttgfatb');
const SequenceElementModel = require('../../models/sequence-element');

exports.getDay = function(dayID, owner, callback) {
    DayModel.findOne({
        _id: dayID,
        owner: owner
    }, function(err, day) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const responseObj = {
                id: day._id,
                owner: owner,
                date: day.date,
                checksum: day.checksum,
                events: day.events,
                timeToGetFromAtoB: day.timeToGetFromAtoB,
                sequence: day.sequence
            };

            if (typeof callback === 'function') {
                callback(null, {
                    day: responseObj
                });
            }
        }
    });
};

exports.getDays = function(owner, callback) {
    DayModel.find({
        owner: owner
    }, function(err, dayObjects) {
        if (err) {
			console.error(err);
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            let responseObjects = [];
            dayObjects.forEach(function(e) {
                const obj = {
                    id: e._id,
                    owner: owner,
                    date: e.date,
                    checksum: e.checksum,
                    events: e.events,
                    timeToGetFromAtoB: e.timeToGetFromAtoB,
                    sequence: e.sequence
                };
                responseObjects.push(obj);
            });

            if (typeof callback === 'function') {
                callback(null, {
                    days: responseObjects
                });
            }
        }
    });
};

Date.prototype.endOfDay = function() {
	this.setHours(59);
	this.setMinutes(59);
	this.setSeconds(59);
	this.setMilliseconds(999);
	return this;
};

Date.prototype.startOfDay = function() {
	this.setHours(0);
	this.setMinutes(0);
	this.setSeconds(0);
	this.setMilliseconds(0);
	return this;
};

exports.newDay = function(day, owner, callback) {
	// Check if user has a day for this date already
	const endOfDay = (new Date(day.date)).endOfDay();
	const startOfDay = (new Date(day.date)).startOfDay();

	DayModel.findOne({
		$and: [
			{owner: owner},
			{date: {$gte: startOfDay, $lte: endOfDay}}
		]
	}, function(err, existsDay) {
		if (existsDay) {
			callback('Day already exists');
		} else {
			let _day = new DayModel({
		        owner: owner,
		        date: day.date,
		        events: [],
		        timeToGetFromAtoB: [],
		        sequence: []
		    });

			_day = utils.createChecksum(_day);

		    _day.save(function(err, dayObj) {
		        if (err) {
					console.error(err);
		            if (typeof callback === 'function') {
		                return callback(err, null);
		            }
		        } else {
		            const responseObj = {
		                id: dayObj._id,
		                owner: owner,
		                date: dayObj.date,
		                checksum: dayObj.checksum,
		                events: dayObj.events,
		                timeToGetFromAtoB: dayObj.timeToGetFromAtoB,
		                sequence: dayObj.sequence
		            };

		            if (typeof callback === 'function') {
		                callback(null, {
		                    day: responseObj
		                });
		            }
		        }
		    });
		}
	});
};

exports.updateDay = function(day, dayID, owner, callback) {
    const _day = {
        id: dayID,
        owner: owner,
        date: day.date,
        checksum: day.checksum,
        events: day.events,
        timeToGetFromAtoB: day.timeToGetFromAtoB,
        sequence: day.sequence
    };

    DayModel.update({
        _id: dayID,
        owner: owner
    }, {
        $set: _day
    }, function(err, dayObj) {
        if (err) {
			console.error(err);
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const responseObj = {
                id: dayObj._id,
                owner: owner,
                date: dayObj.date,
                checksum: dayObj.checksum,
                events: dayObj.events,
                timeToGetFromAtoB: dayObj.timeToGetFromAtoB,
                sequence: dayObj.sequence
            };

			if (typeof callback === 'function') {
                callback(null, {
                    day: responseObj
                });
            }
        }
    });
};

exports.deleteDay = function(dayID, owner, callback) {
	DayModel.findOne({
		_id: dayID,
		owner: owner
	}).remove(function(err) {
		if (err) {
			console.error(err);
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			if (typeof callback === 'function') {
				callback(null);
			}
		}
	});
};

exports.addEventToDay = function(dayID, owner, eventID, callback) {
	DayModel.findOne({
		_id: dayID,
		owner: owner
	}, function(err, day) {
		console.log(day);
		console.log(err);
		if (err || !day) {
			console.error(err);
			if (typeof callback === 'function') {
				callback (err, null);
			}
			else {
				if (day) {
					day.events.push(eventID);
					sortDay(day, function (err, sortedDay) {
				        if (err) {
				            console.error(err);
				            if (typeof callback === 'function') {
			                	callback (err, null);
			                }
				        }
				        const _day = new DayModel(sortedDay);
				        _day.save(function(err) {
				        	if (typeof callback === 'function') {
				        		callback(err);
				        	}
				        });
					});
				} else {
					if (typeof callback === 'function') {
						callback('Day not found');
					}
				}
			}
		}
	});
};

exports.removeEventFromDay = function(dayID, owner, eventID, callback) {
	DayModel.findOne({
		_id: dayID,
		owner: owner
	}, function(err, day) {
		if (err) {
			console.error(err);
			if (typeof callback === 'function') {
				callback (err, null);
			}
			else {
				day.events.forEach(function(e, i) {
					if (e === eventID) {
						day.events.splice(i, 1);
					}
				});
				day.save(function(err) {
					if (typeof callback === 'function') {
						callback(err);
					}
				});
			}
		}
	});
};

function sortDay (day, callback) {
    const _ttgfatb = [];
    const _sequence = [];
    const owner = day.owner;
    const dayID = day.id;
    
    dayLib.sortDay(day, function (err, sequence, ttgfatb) {
        asyncjs.forEachOf(ttgfatb, function (e, i, done) {
            new timeToGetFromAtoBModel.create({
                owner: owner,
                day: dayID,
                time: e.time
            }, function (err, ttgfatbElement){
                if(err) {
                    callback(err);
                }
                    _ttgfatb[e.referenceID] = ttgfatbElement._id;
                    done();
            });
        }, function () {
            asyncjs.forEachOf(sequence, function (e, i, done) {
                new SequenceElementModel.create({
                    owner: owner,
                    day: dayID,
                    type: e.type,
                    referenceID: e.referenceID
                }, function (err, sequenceElement) {
                    if(err) {
                        callback(err);
                    }
                    _sequence[i] = sequenceElement._id;
                    done();
                });
            }, function () {
                day.sequence = _sequence;
                day.ttgfatb = _ttgfatb;
                callback(null, day);
            });
        });
    });
}
