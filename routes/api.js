'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const utils = require('../lib/utils');
const userRoute = require('./users');
const devicesRoute = require('./devices');
const eventsRoute = require('./events');

const userModel = require('../models/user');

const config = require('../config');

const api = express.Router();

api.use('/users', userRoute);
api.use('/devices', devicesRoute);
api.use('/events', eventsRoute);

api.get('/', function(req, res) {
    res.json({
        message: 'hi'
    });
});

api.post('/authenticate', function(req, res) {
    if (req.body.username && req.body.password) {
        userModel.findOne({
            username: req.body.username
        }, function(err, usr) {
			if (usr) {
                if (utils.hashPassword(req.body.password, usr.salt) === usr.password) {

                    const token = jwt.sign({
                        username: usr.username,
                        email: usr.email
                    }, config.jwtSecret, {
                        expiresIn: 30 * 24 * 60 * 60 // expires in 30 days
                    });

                    res.json({
                        token: token
                    });
                } else {
                    res.sendStatus(401);
                }
            } else {
				res.sendStatus(401);
			}
        });
    } else {
        res.sendStatus(400);
    }
});

module.exports = api;
