'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userModel = require('../models/user');
const utils = require('../lib/utils');

const config = require('../config');

const users = express.Router();

users.use(utils.jwtAuth);

users.get('/', function(req, res) {
    res.status(200).send('true');
});

users.get('/:username', function(req, res) {
    if (req.params.username === req.jwt.username) {
        userModel.findOne({
            username: req.params.username
        }, function(err, user) {
            res.json({
                user: user
            });
        });
    } else {
        res.sendStatus(401);
    }
});


module.exports = users;
