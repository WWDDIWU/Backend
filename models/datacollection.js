"use strict";
const mongoose = require('mongoose');
const types = require('./types');
const UserID = types.UserID;
const EventGroupID = types.EventGroupID;
const EventID = types.EventID;

const DataCollectionSchema = mongoose.Schema({
    owner: UserID,
    similarEvents: [EventGroupID],
    suggestions: [EventID]
});

const DataCollection = mongoose.model('DataCollection', DataCollectionSchema);

exports.DataCollection = DataCollection;