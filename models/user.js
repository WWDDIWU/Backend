"use strict";
const mongoose = require('mongoose');
const types = require('./types');
const LocationID = types.LocationID;
const DayID = types.DayID;
const Checksum = types.Checksum;

const Device = mongoose.Schema({
   lastUpdate: Checksum,
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
    userId: Number,
    name: String,
    lastName: String,
    hash: String,
    salt: String,
    email: String,
    devices: [Device],
    relevantPlaces: {
        home: LocationID,
        work: LocationID,
        other: [LocationID]
    },
    timeline: [DayID],
    unit: {
        type: Number,
        validate: {
            validator: function (v) {
                return (v < 2 && v >= 0);
            },
            message: '{VALUE} is not a valid unit type!'
        }
    }
});

const User = mongoose.model('User', UserSchema);

exports.User = User;