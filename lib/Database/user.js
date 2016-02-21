'use strict';

const express = require('express');
const mongoose = require('mongoose');

const UserModel = require('../../models/user');

exports.getUser = function(owner, callback) {
    UserModel.findOne({
        _id: owner
    }, function(err, user) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        } else {
            callback(null, {
                user: {
                    username: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    timeline: user.timeline,
                    email: user.email,
                    devices: user.devices,
                    home: user.relevantPlaces.home,
                    work: user.relevantPlaces.work,
                    other: user.relevantPlaces.other,
                    metric: user.unit
                }
            });
        }
    });
};

exports.newUser = function(user, callback) {

    const relevantPlaces = {
        home: user.home,
        work: user.work,
        other: user.other
    };
    const _user =  new UserModel({
        _id: user.username,
        firstname: user.firstname,
		password: user.password,
		salt: user.salt,
        lastname: user.lastname,
        timeline: user.timeline,
        email: user.email,
        devices: user.devices,
        relevantPlaces: relevantPlaces,
        metric: user.unit
    });

	_user.save(function(err, user) {
		if (err) {
            if (typeof callback === 'function') {
                callback(err);
            }
		} else {
            callback(null, user);
        }
    });
};
