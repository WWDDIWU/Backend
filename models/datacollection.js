'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const DataCollectionSchema = mongoose.Schema({
    owner: mongoose.Schema.Types.UserID,
    similarEvents: [mongoose.Schema.Types.EventGroupID],
    suggestions: [mongoose.Schema.Types.EventID]
});

const DataCollection = mongoose.model('DataCollection', DataCollectionSchema);

exports.DataCollection = DataCollection;
