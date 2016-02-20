'use strict';

const mongoose = require('mongoose');
const types = require('./types');

function validateLocation (location){
    const regex = /(-)?\d+\.\d+,(-)?\d+.\d+/;
    return location.match(regex);
}

const LocationSchema = mongoose.Schema({
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
    }
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
