'use strict';

const mongoose = require('mongoose');
const types = require('./types');
const LocationID = types.LocationID;
const DayID = types.DayID;
const Checksum = types.Checksum;

const Device = mongoose.Schema({
   lastUpdate: mongoose.Schema.Types.Checksum,
   type: {
       type: Number,
       validate: {
           validator: function (value) {
               return (value < 3 && value > -1);
           },
           message: '{VALUE} is not a valid device type!'
       }
   }
});

const UserSchema = mongoose.Schema({
    username: String,
	firstname: String,
	lastName: String,
    hash: String,
    salt: String,
    email: String,
    devices: [Device],
    relevantPlaces: {
        home: mongoose.Schema.Types.LocationID,
        work: mongoose.Schema.Types.LocationID,
        other: [mongoose.Schema.Types.LocationID]
    },
    timeline: [mongoose.Schema.Types.DayID]
});

const User = mongoose.model('User', UserSchema);

exports = User;
