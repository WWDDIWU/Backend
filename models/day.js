'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const DaySchema = mongoose.Schema({
    owner: mongoose.Schema.Types.UserID,
    date: Date,
    checksum: mongoose.Schema.Types.Checksum,
    events: [mongoose.Schema.Types.EventID],
    timeToGetFromAtoB: [mongoose.Schema.Types.TtgfatbID],
    sequence: [mongoose.Schema.Types.SequenceElementID]
});

const Day = mongoose.model('Day', DaySchema);

module.exports = Day;
