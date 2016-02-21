'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../models/user');
const EventModel = require('../models/event');

const eventManager = require('../lib/Database/event');

const events = express.Router();

events.get('/:event_id', function(req, res) {
    eventManager.getEvent(req.params.event_id, req.jwt.username, function(err, event) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(event);
		}
	});
});

events.get('/', function(req, res) {
	eventManager.getEvents(req.jwt.username, function(err, events) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(events);
		}
	});
});

events.post('/', function(req, res) {
	eventManager.newEvent(req.body.event, req.jwt.username, function(err, event) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(event);
		}
	});
});

events.delete('/:event_id', function(req, res) {
    eventManager.deleteEvent(req.params.event_id, req.jwt.username, function(err) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.sendStatus(200);
		}
	});
});

events.put('/:event_id', function(req, res) {
	eventManager.updateEvent(req.body.event, req.params.event_id, req.jwt.username, function(err, event) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(event);
		}
	});
});
module.exports = events;
