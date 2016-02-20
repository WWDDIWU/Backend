'use strict';

const mongoose = require('mongoose');
const types = require('./types');

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
    owner: mongoose.Schema.Types.UserID,
    date: Date,
    checksum: mongoose.Schema.Types.Checksum,
    events: [mongoose.Schema.Types.EventID],
    timeToGetFromAtoB: [Number],
    sequence: [SequenceElementSchema]
});

const Day = mongoose.model('Day', DaySchema);

exports.Day = Day;
