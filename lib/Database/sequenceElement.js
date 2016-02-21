'use strict';

const express = require('express');
const mongoose = require('mongoose');

const utils = require('../utils');

const SequenceElementModel = require('../../models/location');

exports.getSequenceElements = function(owner, callback) {
	SequenceElementModel.find({
		owner: owner
	}, function(err, sequenceElementObjects) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			let responseObjects = [];

			sequenceElementObjects.forEach(function(e) {
				const responseObj = {
					id: e._id,
					type: e.type,
					value: e.referenceID,
					day: e.dayID
				};
				responseObjects.push(responseObj);
			});

			if (typeof callback === 'function') {
				callback(null, {'sequence-elements': responseObjects});
			}
		}
	});
};

exports.getSequenceElement = function (sequenceElementID, owner, callback) {
	SequenceElementModel.findOne({
		_id: sequenceElementID,
		owner: owner
	}, function(err, sequenceElementObj) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {
			const responseObj = {
				id: sequenceElementObj._id,
				type: sequenceElementObj.type,
				value: sequenceElementObj.referenceID,
				day: sequenceElementObj.dayID
			};

			if (typeof callback === 'function') {
				callback(null, {'sequence-element': responseObj});
			}
		}
	});
};

exports.updateSequenceElement = function(sequenceElement, sequenceElementID, owner, callback) {
	const _sequenceElement = {
		id: sequenceElementID,
		type: sequenceElement.type,
		value: sequenceElement.referenceID,
		day: sequenceElement.dayID
	};

	SequenceElementModel.update({
		_id: sequenceElementID,
		owner: owner
	}, {
		$set: _sequenceElement
	}, function(err, sequenceElementObj) {
		if (err) {
			if (typeof callback === 'function') {
				callback(err);
			}
		} else {

			const responseObj = {
				id: sequenceElementObj._id,
				type: sequenceElementObj.type,
				value: sequenceElementObj.referenceID,
				day: sequenceElementObj.dayID
			};

			if (typeof callback === 'function') {
				callback(null, {'sequence-element': responseObj});
			}
		}
	});
};
