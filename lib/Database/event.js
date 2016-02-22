'use strict';

const express = require('express');
const mongoose = require('mongoose');

const EventModel = require('../../models/event');

const dayManager = require('./day');
const locationManager = require('./location');

exports.getEvent = function(eventID, owner, callback) {
    EventModel.findOne({
        _id: eventID,
        owner: owner
    }, function(err, event) {
        if (err) {
            console.error(err);
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

    EventModel.find(filteredQuery, function(err, _events) {
        if (err) {
            console.error(err);
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            if (typeof callback === 'function') {

				let events = [];
				_events.forEach(function(e, i) {
					const obj = {
						priority: e.priority,
		                title: e.title,
		                description: e.description,
		                suggestion: e.suggestion,
		                location: e.location,
		                day: e.day,
		                type: e.type,
		                start: e.time.start,
		                end: e.time.end,
		                duration: e.time.duration,
		                id: e._id
					};
					events.push(obj);
				});

                callback(null, {events: events});
            }
        }
    });
};

Date.prototype.startOfDay = function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};

exports.newEvent = function(event, owner, callback) {
	// Get day
	const dayTime = (new Date(event.start)).startOfDay();
	const day = {
		date: dayTime
	};
	// Create new day if it does not exist
	// functions returns reference to day if it exists
	dayManager.newDay(day, owner, function(err, dayObj) {
		const time = {
	        start: (event.type !== 1) ? event.start : null,
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
	        day: dayObj.id,
	        type: event.type,
	        owner: owner
	    });

	    _event.save(function(err, eventObj) {
	        if (err) {
	            console.error(err);
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

				console.log(dayObj.day.id);
				console.log(eventObj._id);

	            // Add the event to the day model
	            dayManager.addEventToDay(dayObj.day.id, owner, eventObj._id);

				// Add the event to the location model
				locationManager.addEventToLocation(event.location, owner, eventObj._id);

	            if (typeof callback === 'function') {
	                callback(null, {
	                    event: obj
	                });
	            }
	        }
	    });
	});
};

exports.deleteEvent = function(eventID, owner, callback) {
    EventModel.find({
        _id: eventID,
        owner: owner
    }, function(err, event) {
        event.remove(function(err) {
            if (err) {
                console.error(err);
                if (typeof callback === 'function') {
                    callback(err);
                }
            } else {
                // Remove the event from the day model
                dayManager.removeEventFromDay(event.day, owner, eventID);
				// Remove the event from the location model
				locationManager.removeEventFromLocation(event.location, owner, eventID);
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
            console.error(err);
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
