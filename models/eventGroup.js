"use strict";
const mongoose = require('mongoose');
const types = require('./types');
const UserID = types.UserID;
const EventID = types.EventID;

const UserSchema = mongoose.Schema({
    owner: UserID,
    eventList: [EventID],
    tags: {
       type: [String],
       validate: {
           validator: function (value) {
                const regex = /(Date|Day|Weekday|Time|Title|Description)/i;
                value.forEach(function (e){
                    if(!e.match(regex)) return false;
                })
                return true;
           },
           message: '{VALUE} is not a valid tag array!'
       }
   }
});

const User = mongoose.model('User', UserSchema);

exports.User = User;