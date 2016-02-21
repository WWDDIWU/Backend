'use strict';

const express = require('express');
const mongoose = require('mongoose');

const userModel = require('../../models/user');

exports.getDevice = function(deviceID, owner, callback) {
    userModel.findOne({
        username: owner
    }, function(err, user) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            const arrayEntry = user.devices[deviceID];

            const device = {
                id: deviceID,
                lastUpdate: arrayEntry.lastUpdate,
                type: arrayEntry.type,
                user: owner
            };

            if (typeof callback === 'function') {
                callback(null, {
                    device: device
                });
            }
        }
    });
};

exports.getDevices = function(query, owner, callback) {
    userModel.findOne({
        username: owner
    }, function(err, user) {
        let deviceArray = user.devices;
        let responseArray = [];
        let availableParameters = ['lastUpdate', 'type'];

        availableParameters.forEach(function(e, i) {
            if (query[e]) {
                availableParameters.splice(i, 1);
            }
        });

        // If only one device is queried
        if (query.id) {
            const dev = deviceArray[query.id];
            deviceArray = [];
            deviceArray.push(dev);
        }

        deviceArray.forEach(function(device, i) {
            availableParameters.forEach(function(parameter, i) {
                if (device[parameter] === query[parameter]) {
                    responseArray.push(device);
                }
            });
        });

        if (typeof callback === 'function') {
            callback(null, {
                devices: responseArray
            });
        }
    });
};

exports.newDevice = function(device, owner, callback) {
    userModel.findByIdAndUpdate(owner, {
        $push: {
            lastUpdate: device.lastUpdate,
            type: device.type
        }
    }, function(err, userObj) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err, null);
            }
        } else {
            let dev = userObj.devices[userObj.devices.length - 1];
            dev.id = userObj.devices.length - 1;
            dev.user = owner;

            if (typeof callback === 'function') {
                callback(null, {
                    device: dev
                });
            }
        }
    });
};

exports.updateDevice = function(device, deviceID, owner, callback) {
    userModel.find({
        username: owner
    }, function(err, user) {
        user.devices[deviceID].lastUpdate = device.lastUpdate;
        user.devices[deviceID].type = device.type;

        userModel.update({
            username: owner
        }, {
            $set: {
                devices: user.devices
            }
        }, function(err, user) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err, null);
                }
            } else {
                let device = user.devices[deviceID];
                device.id = deviceID;
                device.user = owner;
            }

            if (typeof callback === 'function') {
                callback(null, {
                    device: device
                });
            }
        });
    });
};

exports.deleteDevice = function(deviceID, owner, callback) {
	userModel.find({
        username: owner
    }, function(err, user) {
		if (err) {
			if (typeof callback === 'function') {
				return callback(err, null);
			}
		}

        delete user.devices[deviceID];

        userModel.update({
            username: owner
        }, {
            $set: {
                devices: user.devices
            }
        }, function(err, user) {
            if (err) {
                if (typeof callback === 'function') {
					callback(err, null);
				}
            } else {
				if (typeof callback === 'function') {
					callback();
				}
			}
        });
    });
};
