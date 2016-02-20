'use strict';

const crypto = require('crypto');

const asyncjs = require('async');
const mongoose = require('mongoose');

const utils = require('./utils');
const UserModel = require('../models/user');
const LocationModel = require('../models/location');

mongoose.connect('mongodb://169.53.137.142/wwddiwu');

const createUser = function(properties, callback) {

	crypto.generateRandomBytes(24, function(err, data) {
		const salt = data.toString('hex');
		const hash = utils.passwordHash(properties.password, salt);

		const device = {
			type: properties.deviceType,
			checksum: 0
		};

		const home = new LocationModel({
			name: properties.location.name,
			latitude: properties.location.latitude,
			longitude: properties.location.longitude
		});

		const work = new LocationModel({
			name: properties.location.name,
			latitude: properties.location.latitude,
			longitude: properties.location.longitude
		});

		asyncjs.parallel([
			function (done) {
				home.save(function(err, home) {
					done(err, home);
				});
			},
			function (done) {
				work.save(function(err, work) {
					done(err, work);
				});
			}
		], function(err, models) {
			const user = new UserModel({
				username: properties.name,
				firstName: properties.firstName,
				lastName: properties.lastName,
			    hash: hash,
			    salt: salt,
			    email: properties.email,
			    devices: [device],
			    relevantPlaces: {
			        home: models[0]._id,
			        work: models[0]._id,
			        other: []
			    },
			    timeline: []
			});

			user.save(function(err, user) {
				if (typeof callback === 'function') {
					callback(err);
				}
			});
		});
	});
};
