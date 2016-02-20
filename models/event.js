'use strict';

const mongoose = require('mongoose');
const types = require('./types');

const EventSchema = mongoose.Schema({
    eventID: Number,
    type: {
       type: Number,
       validate: {
           validator: function (value) {
               return (value < 3 && value >= 0);
           },
           message: '{VALUE} is not a valid event type!'
       }
   },
   priority: {
       type: Number,
       validate: {
           validator: function (value) {
               return (value < 2 && value >= 0);
           },
           message: '{VALUE} is not a valid device type!'
       }
   },
   title: String,
   time: mongoose.Schema.Types.Time,
   description: String,
   location: mongoose.Schema.Types.LocationID,
   suggestion: Boolean,
   owner: mongoose.Schema.Types.UserID,
   day: mongoose.Schema.Types.DayID
});

const Event = mongoose.model('Event', EventSchema);

exports.Event = Event;
