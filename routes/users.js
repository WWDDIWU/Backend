'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userModel = require('../models/users');
const utils = require('../utils');

const config = require('../config');

const users = express.Router();

mongoose.connect('mongodb://169.53.137.142/wwddiwu');

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
