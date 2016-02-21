'use strict';

const express = require('express');
const mongoose = require('mongoose');

const DayModel = require('../../models/day');

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

            if (typeof callbac === 'function') {
                callback(null, {
                    days: responseObjects
                });
            }
        }
    });
};

exports.newDay = function(day, owner, callback) {
    const _day = new DayModel({
        owner: owner,
        date: day.date,
        checksum: day.checksum,
        events: day.events,
        timeToGetFromAtoB: day.timeToGetFromAtoB,
        sequence: day.sequence
    });

    _day.save(function(err, dayObj) {
        if (err) {
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
		if (err) {
			if (typeof callback === 'function') {
				callback (err, null);
			}
			else {
				day.events.push(eventID);
				day.save(function(err) {
					if (typeof callback === 'function') {
						callback(err);
					}
				});
			}
		}
	});
};

exports.removeEventFromToday = function(dayID, owner, eventID, callback) {
	DayModel.findOne({
		_id: dayID,
		owner: owner
	}, function(err, day) {
		if (err) {
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
