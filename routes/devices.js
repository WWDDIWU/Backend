'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../models/user');

const deviceManager = require('../lib/Database/device');

const devices = express.Router();

devices.get('/:device_id', function(req, res) {
	deviceManager.getDevice(req.params.device_id, req.jwt.username, function(err, device) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(device);
		}
	});
});

devices.post('/', function(req, res) {
	deviceManager.newDevice(req.device, req.jwt.username, function(err, device) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(device);
		}
	});
});

devices.put('/:device_id', function(req, res) {
	deviceManager.updateDevice(req.body.device, req.params.device_id, req.jqt.username, function(err, device) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(device);
		}
	});
});

devices.delete('/:device_id', function(req, res) {
	deviceManager.deleteDevice(req.params.device_id, req.jwt.username, function(err) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.sendStatus(200);
		}
	});
});

devices.get('/', function(req, res) {
	deviceManager.getDevices(req.query, req.jqt.username, function(err, days) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(days);
		}
	});
});

module.exports = devices;
