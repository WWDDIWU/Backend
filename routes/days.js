'use strict';

const express = require('express');
const mongoose = require('mongoose');

const DayModel = require('../models/day');
const dayManager = require('../lib/Database/day');

const days = express.Router();

days.get('/', function(req, res) {
	dayManager.getDays(req.jwt.username, function(err, days) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(days);
		}
	});
});

days.put('/:day_id', function(req, res) {
    dayManager.updateDay(req.day, req.params.day_id, req.jwt.username, function(err, day) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.status(200).json(day);
        }
    });
});

days.post('/', function(req, res) {
    dayManager.newDay(req.body.day, req.jwt.username, function(err, day) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.status(200).json(day);
        }
    });
});

days.get('/:day_id', function(req, res) {
    dayManager.getDay(req.params.day_id, req.jwt.username, function(err, day) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.status(200).json(day);
        }
    });
});

days.delete('/:day_id', function(req, res) {
    dayManager.deleteDay(req.params.day_id, req.jwt.username, function(err) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = days;
