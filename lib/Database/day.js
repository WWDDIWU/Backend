'use strict';

const express = require('express');
const mongoose = require('mongoose');

const utils = require('../utils');

const DayModel = require('../../models/day');
const UserModel = require('../../models/user');

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
        $and: [{
            owner: owner
        }, {
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }]
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

                    // Push the event to the user
                    UserModel.findOne({
                        _id: owner
                    }, function(err, user) {
                        user.timeline.push(dayObj.id);
						console.log(user.timeline);

						user.save();
                    });

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
            // Remove from user model
            UserModel.findOne({
                _id: owner
            }, function(err, user) {
                user.timeline.forEach(function(e, i) {
                    if (e === dayID) {
                        user.timeline.splice(i, 1);
                    }
                });
				user.save();
            });

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
                callback(err, null);
            } else {
                if (day) {
                    day.events.push(eventID);
                    day.save(function(err) {
                        if (typeof callback === 'function') {
                            callback(err);
                        }
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
                callback(err, null);
            } else {
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
