'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const LocationSchema = mongoose.Schema({
    locationID: Number,
    name: String,
    latitude: Number,
    longitude: Number,
	events: [mongoose.Schema.Types.EventID],
	owner: mongoose.Schema.Types.UserID
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
