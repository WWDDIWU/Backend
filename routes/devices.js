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
