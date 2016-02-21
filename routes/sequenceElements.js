'use strict';

const express = require('express');
const mongoose = require('mongoose');

const SequenceElementModel = require('../models/sequence-element');

const sequenceElementManager = require('../lib/Database/sequenceElement');

const sequenceElements = express.Router();

sequenceElements.get('/', function(req, res) {
	sequenceElementManager.getSequenceElements(req.jwt.username, function(err, sequenceElements) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(sequenceElements);
		}
	});
});

sequenceElements.get('/:seq_id', function(req, res) {
	sequenceElementManager.getSequenceElement(req.params.seq_id, req.jwt.username, function(err, sequenceElement) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(sequenceElement);
		}
	});
});

sequenceElements.put('/:seq_id', function(req, res) {
	sequenceElementManager.updateSequenceElement(req.body['sequence-element'], req.jwt.username, function(err, sequenceElement) {
		if (err) {
			res.sendStatus(500);
		} else {
			res.status(200).json(sequenceElement);
		}
	});
});

module.exports = sequenceElements;
