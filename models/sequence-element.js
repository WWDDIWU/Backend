'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const SequenceElementSchema = mongoose.Schema({
	owner: mongoose.Schema.Types.UserID,
	day: mongoose.Schema.Types.DayID,
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

const SequenceElement = mongoose.model('SequenceElement', SequenceElementSchema);

module.exports = SequenceElement;
