'use strict';

const express = require('express');
const mongoose = require('mongoose');

const SequenceElementModel = require('../models/sequence-element');

const sequenceElements = express.Router();

sequenceElements.get('/', function(req, res) {
	SequenceElementModel.find({
		owner: req.jwt.username
	}, function(err, sequenceElementObjects) {
		if (err) {
			return res.sendStatus(500);
		}
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

		res.status(200).json({'sequence-elements': responseObjects});
	});
});

sequenceElements.get('/:seq_id', function(req, res) {
	SequenceElementModel.findOne({
		_id: req.params.seq_id,
		owner: req.jwt.username
	}, function(err, sequenceElementObj) {
		if (err) {
			return res.sendStatus(500);
		}
		const responseObj = {
			id: sequenceElementObj._id,
			type: sequenceElementObj.type,
			value: sequenceElementObj.referenceID,
			day: sequenceElementObj.dayID
		};
		res.status(200).json({'sequence-element': responseObj});
	});
});

sequenceElements.put('/:seq_id', function(req, res) {
	const sequenceElement = {
		id: req.params.seq_id,
		type: req.body['sequence-element'].type,
		value: req.body['sequence-element'].referenceID,
		day: req.body['sequence-element'].dayID
	};

    SequenceElementModel.update({
        _id: req.params.seq_id,
        owner: req.jwt.username
    }, {
        $set: sequenceElement
    }, function(err, sequenceElementObj) {
        if (err) {
            return res.sendStatus(500);
        } else {

            const responseObj = {
				id: sequenceElementObj._id,
				type: sequenceElementObj.type,
				value: sequenceElementObj.referenceID,
				day: sequenceElementObj.dayID
            };
            res.status(200).json({
                'sequence-element': responseObj
            });
        }
    });
});

module.exports = sequenceElements;
