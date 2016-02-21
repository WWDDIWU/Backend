'use strict';

const express = require('express');
const mongoose = require('mongoose');

const LocationModel = require('../models/location');

const locations = express.Router();

locations.get('/', function(req, res) {
	LocationModel.find({
		owner: req.jwt.username
	}, function(err, locationObjects) {
		if (err) {
			return res.sendStatus(500);
		}

		let responseObjects = [];
		locationObjects.forEach(function(e) {
			const obj = {
				id: e._id,
				latitude: e.latitude,
				longitude: e.longitude,
				events: e.events,
				owner: req.jws.username,
				name: e.name
			};
			responseObjects.push(obj);
		});

		res.status(200).json({locations: responseObjects});
	});
});

locations.get('/:location_id', function(req, res) {
    LocationModel.findOne({
        _id: req.params.location_id,
        owner: req.jws.username
    }, function(err, location) {
        if (err) {
            return res.sendStatus(500);
        }
        const responseObj = {
            id: location._id,
            latitude: location.latitude,
            longitude: location.longitude,
            events: location.events,
            owner: req.jws.username,
            name: location.name
        };

        res.status(200).json({
            location: responseObj
        });
    });
});

locations.post('/', function(req, res) {
    const location = new LocationModel({
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitudem,
        events: req.body.location.events,
        owner: req.jwt.username,
        name: req.body.name
    });

    location.save(function(err, locationObj) {
        if (err) {
            return res.sendStatus(500);
        }

        const responseObj = {
            id: locationObj._id,
            latitude: locationObj.latitude,
            longitude: locationObj.longitudem,
            events: locationObj.events,
            owner: locationObj.owner,
            name: locationObj.name
        };

        res.status(200).json({
            location: responseObj
        });
    });
});

locations.delete('/:location_id', function(req, res) {
	LocationModel.find({
		_id: req.params.location_id,
		owner: req.jwt.username
	}).remove(function(err) {
		if (err) {
			return res.sendStatus(500);
		}
		res.sendStatus(200);
	});
});

module.exports = locations;
