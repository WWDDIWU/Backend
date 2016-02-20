"use strict";
const mongoose = require('mongoose');
const types = require('./types');
const Time = types.Time;
const LocationID = types.LocationID;

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
   time: Time,
   description: String,
   location: LocationID,
   suggestion: Boolean
   
});

const Event = mongoose.model('Event', EventSchema);

exports.Event = Event;