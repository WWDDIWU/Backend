'use strict';

const express = require('express');
const mongoose = require('mongoose');

const utils = require('../utils');

const LocationModel = require('../../models/location');

exports.getLocation = function(locationID, owner, callback) {
    LocationModel.findOne({
        _id: locationID,
        owner: owner
    }, function(err, location) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        } else {
            const responseObj = {
                id: location._id,
                latitude: location.latitude,
                longitude: location.longitude,
                events: location.events,
                owner: owner,
                name: location.name
            };

            if (typeof callback === 'function') {
                callback(null, {
                    location: responseObj
                });
            }
        }
    });
};

exports.getLocations = function(owner, callback) {
    LocationModel.find({
        owner: owner
    }, function(err, locationObjects) {
        if (err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        } else {
            let responseObjects = [];
            locationObjects.forEach(function(e) {
                const obj = {
                    id: e._id,
                    latitude: e.latitude,
                    longitude: e.longitude,
                    events: e.events,
                    owner: owner,
                    name: e.name
                };
                responseObjects.push(obj);
            });

            if (typeof callback === 'function') {
                callback(null, {
                    locations: responseObjects
                });
            }
        }
    });
};

exports.newLocation = function(location, owner, callback) {
	const _location = new LocationModel({
        latitude: location.latitude,
        longitude: location.longitude,
        events: location.events,
        owner: owner,
        name: location.name
    });

    _location.save(function(err, locationObj) {
        if (err) {
            if (typeof callback === 'function') {
				callback(err);
			}
        } else {
			const responseObj = {
	            id: locationObj._id,
	            latitude: locationObj.latitude,
	            longitude: locationObj.longitude,
	            events: locationObj.events,
	            owner: locationObj.owner,
	            name: locationObj.name
	        };

			if (typeof callback === 'function') {
				callback(null, {location: responseObj});
			}
		}
    });
};

exports.removeLocation = function(locationID, owner, callback) {
	LocationModel.find({
		_id: locationID,
		owner: owner
	}).remove(function(err) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		}
		if (typeof callback === 'function') {
			callback(null);
		}
	});
};

exports.addEventToLocation = function(locationID, owner, eventID, callback) {
    LocationModel.findOne({
        _id: locationID,
        owner: owner
    }, function(err, location) {
        if (err || !location) {
            console.error(err);
            if (typeof callback === 'function') {
                callback(err, null);
            } else {
                if (location) {
                    location.events.push(eventID);
                    location.save(function(err) {
                        if (typeof callback === 'function') {
                            callback(err);
                        }
                    });
                } else {
                    if (typeof callback === 'function') {
                        callback('Location not found');
                    }
                }
            }
        }
    });
};

exports.removeEventFromLocation = function(locationID, owner, eventID, callback) {
    LocationModel.findOne({
        _id: locationID,
        owner: owner
    }, function(err, location) {
        if (err) {
            console.error(err);
            if (typeof callback === 'function') {
                callback(err, null);
            } else {
                location.events.forEach(function(e, i) {
                    if (e === eventID) {
                        location.events.splice(i, 1);
                    }
                });
                location.save(function(err) {
                    if (typeof callback === 'function') {
                        callback(err);
                    }
                });
            }
        }
    });
};
