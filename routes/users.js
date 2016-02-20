'use strict';

const express = require('express');
const users = express.Router();

users.get('/', function(req, res) {
    res.status(200).send('true');
});



module.exports = users;
