'use strict';

const express = require('express');
const mongoose = require('mongoose');

const utils = require('../utils');

const TtgfatbModel = require('../../models/location');

exports.getTtgfatbs = function(owner, callback) {
	TtgfatbModel.find({
		owner: owner
	}, function(err, TtgfatbObjects) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			let responseObjects = [];

			TtgfatbObjects.forEach(function(e) {
				const responseObj = {
					id: e._id,
					time: e.time,
					day: e.dayID
				};
				responseObjects.push(responseObj);
			});

			if (typeof callback === 'function') {
				callback(null, {ttgfatbs: responseObjects});
			}
		}
	});
};

exports.getTtgfatb = function(ttgfatbID, owner, callback) {
	TtgfatbModel.findOne({
		_id: ttgfatbID,
		owner: owner
	}, function(err, ttgfatbObj) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			const responseObj = {
				id: ttgfatbObj._id,
				time: ttgfatbObj.time,
				day: ttgfatbObj.dayID
			};

			if (typeof callback === 'function') {
				callback(null, {ttgfatb: responseObj});
			}
		}
	});
};

exports.updateTtgfatb = function(ttgfatb, ttgfatbID, owner, callback) {
	const _ttgfatb = {
		id: ttgfatbID,
		time: ttgfatb.time,
		day: ttgfatb.dayID
	};

	TtgfatbModel.update({
		_id: ttgfatbID,
		owner: owner
	}, {
		$set: _ttgfatb
	}, function(err, ttgfatbObj) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			const responseObj = {
				id: ttgfatbObj._id,
				time: ttgfatbObj.time,
				day: ttgfatbObj.dayID
			};

			if (typeof callback === 'function') {
				callback(null, {
					ttgfatb: responseObj
				});
			}
		}
	});
};
