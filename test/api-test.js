'use strict';

const mocha = require('mocha');
const should = require('should');

const mongoose = require('mongoose');

const dayManager = require('../lib/Database/day');
const deviceManager = require('../lib/Database/device');
const eventManager = require('../lib/Database/event');
const locationManager = require('../lib/Database/location');
const sequenceElementManager = require('../lib/Database/sequenceElement');
const ttgfatbManager = require('../lib/Database/ttgfatb');
const userManager = require('../lib/Database/user');

mongoose.connect('mongodb://169.53.137.142/wwddiwu');

describe('Test the whole api', function() {

	const owner = 'mrrobot';

	let dayID;
	let locationID;

	// Remove everything from mrrobot
	before(function() {
	});

	describe('Create user', function() {
		it('create user account', function(done) {
			const dev = {
				lastUpdate: Date.now(),
				type: 2
			};

			const user = {
				firstname: 'Test',
				lastname: 'Name',
				username: owner,
				email: 'test@test.de',
				password: '125d6d03b32c84d492747f79cf0bf6e179d287f341384eb5d6d3197525ad6be8e6df0116032935698f99a09e265073d1d6c32c274591bf1d0a20ad67cba921bc',
			    salt: 'test',
			    devices: [],
			    relevantPlaces: {
			        home: null,
			        work: null,
			        other: []
			    },
			    unit: 1,
			    timeline: []
			};

			userManager.newUser(user, function(err, user) {
				done();
			});
		});
	});


	describe('Create day', function() {
		it('create day model', function(done) {
			const day = {
				owner: owner,
				date: new Date(),
			};
			dayManager.newDay(day, owner, function(err, _day) {
				dayID = _day.day.id;
				done();
			});
		});
	});

	describe('Create location', function() {
		it('create location', function(done) {
			const responseObj = {
				latitude: 11,
				longitude: 49,
				events: [],
				owner: owner,
				name: 'Mamas haus'
			};
			locationManager.newLocation(responseObj, owner, function(err, location) {
				locationID = location.location.id;
				done();
			});
		});
	});

	describe('Create event', function() {
		it('create event', function(done) {
			this.timeout(5000);
			const event = {
                priority: 1,
                title: 'Kuchen backen',
                description: 'Mit Mama Kuchen backen',
                suggestion: false,
                location: locationID,
                day: null,
                type: 1,
                start: (new Date()).setHours(8),
                end: (new Date()).setHours(12),
                duration: null
			};

			eventManager.newEvent(event, owner, function(err, event) {
				done();
			});

		});
	});


});
