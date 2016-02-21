'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../models/user');
const EventModel = require('../models/event');

const events = express.Router();

events.get('/:event_id', function(req, res) {
    EventModel.findOne({
        _id: req.params.event_id
    }, function(err, event) {
        if (event.owner === req.jwt.username) {
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
            res.json({
                event: responseObject
            });
        } else {
            res.sendStatus(401);
        }
    });
});

events.get('/', function(req, res) {
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
        if (req.query[field]) {
            filteredQuery[fieldName] = req.query[field];
        }
    });

    filteredQuery.owner = req.jwt.username;

    EventModel.find(filteredQuery, function(err, events) {
        res.json({
            events: events
        });
    });
});

events.post('/', function(req, res) {

    const time = {
        start: req.body.event.start,
        end: req.body.event.end,
        duration: req.body.event.duration
    };

    const event = new EventModel({
        priority: req.body.event.priority,
        title: req.body.event.title,
        description: req.body.event.description,
        time: time,
        suggestion: req.body.event.suggestion,
        location: req.body.event.location,
        day: req.body.event.day,
        type: req.body.event.day,
        owner: req.jwt ? req.jwt.username : null
    });

    event.save(function(err) {
        if (err) {
            return res.sendStatus(500);
        }
    });

    res.sendStatus(200);
});

events.delete('/:event_id', function(req, res) {

	EventModel.find({
		_id: req.params.event_id
	}).remove(function(err) {
		if (err) {
			return res.sendStatus(500);
		}
		res.sendStatus(200);
	});
});

events.put('/:event_id', function(req, res) {

    const time = {
        start: req.body.event.start,
        end: req.body.event.end,
        duration: req.body.event.duration
    };

    const event = {
        priority: req.body.event.priority,
        title: req.body.event.title,
        description: req.body.event.description,
        time: time,
        suggestion: req.body.event.suggestion,
        location: req.body.event.location,
        day: req.body.event.day,
        type: req.body.event.day,
        owner: req.jwt ? req.jwt.username : null
    };

    EventModel.update({
        _id: req.params.event_id
    }, { $set: event }, function(err) {
        if (err) {
            return res.sendStatus(401);
        } else {
            return res.sendStatus(200);
        }
    });
});

module.exports = events;
