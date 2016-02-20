'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../models/user');
const eventModel = require('../models/event');

const events = express.Router();

mongoose.connect('mongodb://169.53.137.142/wwddiwu');

events.get('/:event_id', function(req, res) {
    eventModel.findOne({
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
  	const acceptableFields = ['id',	'title', 'description', 'start', 'end', 'duration', 'suggestion', 'location', 'day'];

	acceptableFields.forEach(function(field, i) {
		// Filter the time.* fields
		let fieldName = field;
		if (field === 'start' || field === 'end' || field === 'duration') {
			fieldName = 'time.' + fieldName;
		}
		if (req.query[field]) {
			filteredQuery[fieldName] = req.query[field];
		}
	});

	filteredQuery.owner = req.jwt.username;

	eventModel.find(filteredQuery, function(err, events) {
		res.json({events: events});
	});
});
