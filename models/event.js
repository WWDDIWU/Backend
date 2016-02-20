'use strict';

const mongoose = require('mongoose');
const types = require('./types');
const Time = types.Time;
const UserID = types.UserID;
const DayID = types.DayID;
const LocationID = types.LocationID;

const EventSchema = mongoose.Schema({
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
   suggestion: Boolean,
   owner: UserID,
   day: DayID
});

const Event = mongoose.model('Event', EventSchema);

exports.Event = Event;
