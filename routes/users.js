'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userModel = require('../models/user');
const utils = require('../lib/utils');

const userManager = require('../lib/Database/user');

const config = require('../config');

const users = express.Router();

users.get('/', function(req, res) {
    res.status(200).send('true');
});

users.get('/:username', function(req, res) {
    if (req.params.username === req.jwt.username) {
        userManager.getUser(req.params.username, function(err, user) {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).json(user);
			}
		});
    } else {
        res.sendStatus(401);
    }
});


module.exports = users;
