'use strict';

const express = require('express');
const mongoose = require('mongoose');

const EventModel = require('../../models/event');

const dayManager = require('./day');

exports.getEvent = function(eventID, owner, callback) {
    EventModel.findOne({
        _id: eventID,
        owner: owner
    }, function(err, event) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            let responseObject = {
                id: event._id,
                priority: event.priority,
                title: event.title,
                description: event.description,
                start: event.time.start,
                end: event.time.end,
                duration: event.time.duration,
                suggestion: event.suggestion,
                location: event.location,
                day: event.day
            };
            if (typeof callback === 'function') {
                callback(null, {
                    event: responseObject
                });
            }
        }
    });
};

exports.getEvents = function(query, owner, callback) {
    let filteredQuery = {};
    const acceptableFields = ['id', 'title', 'description', 'start', 'end', 'duration', 'suggestion', 'location', 'day'];

    acceptableFields.forEach(function(field, i) {
        // Filter the time.* fields
        let fieldName = field;
        if (field === 'start' || field === 'end' || field === 'duration') {
            fieldName = 'time.' + fieldName;
        }
        if (field === 'id') {
            fieldName = '_id';
        }
        if (query[field]) {
            filteredQuery[fieldName] = query[field];
        }
    });

    filteredQuery.owner = owner;

    EventModel.find(filteredQuery, function(err, events) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            callback(null, {
                events: events
            });
        }
    });
};

exports.newEvent = function(event, owner, callback) {
    const time = {
        start: event.start,
        end: event.end,
        duration: event.duration
    };

    const _event = new EventModel({
        priority: event.priority,
        title: event.title,
        description: event.description,
        time: time,
        suggestion: event.suggestion,
        location: event.location,
        day: event.day,
        type: event.type,
        owner: owner
    });

    _event.save(function(err, eventObj) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const obj = {
                priority: eventObj.priority,
                title: eventObj.title,
                description: eventObj.description,
                suggestion: eventObj.suggestion,
                location: eventObj.location,
                day: eventObj.day,
                type: eventObj.type,
                start: eventObj.time.start,
                end: eventObj.time.end,
                duration: eventObj.time.duration,
                id: eventObj._id
            };

			// Add the event to the day model
			dayManager.addEventToDay(event.day, owner, eventObj._id);

            if (typeof callback === 'function') {
                callback(null, {
                    event: obj
                });
            }
        }
    });
};

exports.deleteEvent = function(eventID, owner, callback) {
    EventModel.find({
        _id: eventID,
        owner: owner
    }, function(err, event) {
		event.remove(function(err) {
	        if (err) {
	            if (typeof callback === 'function') {
	                callback(err);
	            }
	        } else {
				// Remove the event from the day model
				dayManager.removeEventFromToday(event.day, owner, eventID);
	            if (typeof callback === 'function') {
	                callback(null);
	            }
	        }
	    });
	});
};

exports.updateEvent = function(event, eventID, owner, callback) {
    const time = {
        start: event.start,
        end: event.end,
        duration: event.duration
    };

    const _event = {
        priority: event.priority,
        title: event.title,
        description: event.description,
        time: time,
        suggestion: event.suggestion,
        location: event.location,
        day: event.day,
        type: event.type,
        owner: owner
    };

    EventModel.update({
        _id: eventID
    }, {
        $set: _event
    }, function(err, eventObj) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const obj = {
                priority: eventObj.priority,
                title: eventObj.title,
                description: eventObj.description,
                suggestion: eventObj.suggestion,
                location: eventObj.location,
                day: eventObj.day,
                type: eventObj.type,
                start: eventObj.time.start,
                end: eventObj.time.end,
                duration: eventObj.time.duration,
                id: eventObj._id
            };

            if (typeof callback === 'function') {
                callback(null, {
                    event: eventObj
                });
            }
        }
    });
};
