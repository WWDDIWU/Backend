'use strict';

const express = require('express');
const mongoose = require('mongoose');

const LocationModel = require('../models/location');

const locationManager = require('../lib/Database/location');

const locations = express.Router();

locations.get('/', function(req, res) {
	locationManager.getLocations(req.jwt.username, function(err, locations) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(locations);
		}
	});
});

locations.get('/:location_id', function(req, res) {
	locationManager.getLocation(req.params.location_id, req.jwt.username, function(err, location) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(location);
		}
	});
});

locations.post('/', function(req, res) {
	locationManager.newLocation(req.location, req.jwt.username, function(err, location) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(location);
		}
	});
});

locations.delete('/:location_id', function(req, res) {
	locationManager.removeLocation(req.params.location_id, req.jwt.username, function(err) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.sendStatus(200);
		}
	});
});

module.exports = locations;
