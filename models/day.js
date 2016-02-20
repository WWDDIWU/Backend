"use strict";
const mongoose = require('mongoose');
const types = require('./types');
const UserID = types.UserID;
const Checksum = types.Checksum;
const EventID = types.EventID;

const SequenceElementSchema = mongoose.Schema({
    type: {
        type: Number,
        validate: {
            validator: function (value){
                return (value >= 0 && value < 2);
            },
            message: '{VALUE} is not a valid element type!'
        }
    },
    referenceID: Number //TO DO: needs to be validated
});

const DaySchema = mongoose.Schema({
    owner: UserID,
    date: Date,
    checksum: Checksum,
    events: [EventID],
    timeToGetFromAtoB: [Number],
    sequence: [SequenceElementSchema]
});

const Day = mongoose.model('Day', DaySchema);

exports.Day = Day;