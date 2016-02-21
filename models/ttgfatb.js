'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const TtgfatbSchema = mongoose.Schema({
	owner: mongoose.Schema.Types.UserID,
	day: mongoose.Schema.Types.DayID,
    time: {
        type: Number
    }
});

const Ttgfatb = mongoose.model('Ttgfatb', TtgfatbSchema);

module.exports = Ttgfatb;
