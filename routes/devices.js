'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../models/user');

const devices = express.Router();

devices.get('/:device_id', function(req, res) {
    userModel.findOne({
        username: req.jwt.username
    }, function(err, user) {
        const arrayEntry = user.devices[req.params.device_id];

        const device = {
            id: req.params.device_id,
            lastUpdate: arrayEntry.lastUpdate,
            type: arrayEntry.type,
            user: req.jwt.username
        };

        res.json({
            device: device
        });
    });
});

devices.post('/', function(req, res) {
    userModel.findByIdAndUpdate(req.jwt.username, {
        $push: {
            lastUpdate: req.body.device,
            type: req.body.type
        }
    }, function(err, userObj) {
        if (err) {
            return res.sendStatus(500);
        }

        let dev = userObj.devices[userObj.devices.length - 1];
        dev.id = userObj.devices.length - 1;
        dev.user = req.jwt.username;

        res.status(200).json({
            device: dev
        });
    });
});

devices.put('/:device_id', function(req, res) {
	userModel.find({
		username: req.jwt.username
	}, function(err, user) {
		user.devices[req.params.device_id].lastUpdate = req.body.device.lastUpdate;
		user.devices[req.params.device_id].type = req.body.device.type;

		userModel.update({
			username: req.jwt.username
		}, { $set: {
			devices: user.devices
		}}, function(err, user) {
			if (err) {
				return res.sendStatus(500);
			}

			let device = user.devices[req.params.device_id];
			device.id = req.params.device_id;
			device.user = req.jwt.username;

			res.status(200).json({
				device: device
			});
		});
	});
});

devices.delete('/:device_id', function(req, res) {
	userModel.find({
		username: req.jwt.username
	}, function(err, user) {
		delete user.devices[req.params.device_id];

		userModel.update({
			username: req.jwt.username
		}, { $set: {
			devices: user.devices
		}}, function(err, user) {
			if (err) {
				return res.sendStatus(500);
			}
			res.sendStatus(200);
		});
	});
});

devices.get('/', function(req, res) {
    userModel.findOne({
        username: req.jwt.username
    }, function(err, user) {
        let deviceArray = user.devices;
        let responseArray = [];

        // User tries to acces devices by different user
        if (req.query.user !== req.jwt.username) {
            res.sendStatus(401);
        }

        let availableParameters = ['lastUpdate', 'type'];

        availableParameters.forEach(function(e, i) {
            if (!req.query[e]) {
                availableParameters.splice(i, 1);
            }
        });

        // If only one device is queried
        if (req.query.id) {
            const dev = deviceArray[req.query.id];
            deviceArray = [];
            deviceArray.push(dev);
        }

        deviceArray.forEach(function(device, i) {
            availableParameters.forEach(function(parameter, i) {
                if (device[parameter] === req.query[parameter]) {
                    responseArray.push(device);
                }
            });
        });

        res.json({
            devices: responseArray
        });
    });
});

module.exports = devices;
