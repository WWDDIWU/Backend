'use strict';

const express = require('express');
const api = express.Router();


api.get('/', function(req, res) {
    res.status(200).send('true');
});


module.exports = api;
