'use strict';

const express = require('express');
const mongoose = require('mongoose');

const TtgfatbModel = require('../models/ttgfatb');

const ttgfatbManager = require('../lib/Database/ttgfatb');

const ttgfatbs = express.Router();

ttgfatbs.get('/', function(req, res) {
	ttgfatbManager.getTtgfatbs(req.jwt.username, function(err, ttgfatbs) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(ttgfatbs);
		}
	});
});

ttgfatbs.get('/:ttgfatb_id', function(req, res) {
	ttgfatbManager.getTtgfatb(req.params.ttgfatb_id, req.jwt.username, function(err, ttgfatb) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(ttgfatb);
		}
	});
});

ttgfatbs.put('/:ttgfatb_id', function(req, res) {
	ttgfatbManager.updateTtgfatbs(req.body.ttgfatb, req.jwt.username, function(err, ttgfatb) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(ttgfatb);
		}
	});
});

module.exports = ttgfatbs;
