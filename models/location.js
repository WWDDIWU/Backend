'use strict';

const mongoose = require('mongoose');
const types = require('./types');

function validateLocation (location){
    const regex = /(-)?\d+\.\d+,(-)?\d+.\d+/;
    return location.match(regex);
}

const LocationSchema = mongoose.Schema({
    locationID: Number,
    name: String,
    latitude: {
        type: Number,
        validate: {
            validator: validateLocation,
            message: '{VALUE} is not a valid latitude!'
        }
    },
    longitude: {
        type: Number,
        validate: {
            validator: validateLocation,
            message: '{VALUE} is not a valid longitude!'
        }
    },
	events: [mongoose.Schema.Types.EventID],
	owner: mongoose.Schema.Types.UserID
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
