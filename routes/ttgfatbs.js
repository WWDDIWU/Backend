'use strict';

const express = require('express');
const mongoose = require('mongoose');

const TtgfatbModel = require('../models/ttgfatb');

const ttgfatbs = express.Router();

ttgfatbs.get('/', function(req, res) {
	TtgfatbModel.find({
		owner: req.jwt.username
	}, function(err, TtgfatbObjects) {
		if (err) {
			return res.sendStatus(500);
		}
		let responseObjects = [];

		TtgfatbObjects.forEach(function(e) {
			const responseObj = {
				id: e._id,
				time: e.time,
				day: e.dayID
			};
			responseObjects.push(responseObj);
		});

		res.status(200).json({ttgfatbs: responseObjects});
	});
});

ttgfatbs.get('/:ttgfatb_id', function(req, res) {
	TtgfatbModel.findOne({
		_id: req.params.ttgfatb_id,
		owner: req.jwt.username
	}, function(err, ttgfatbObj) {
		if (err) {
			return res.sendStatus(500);
		}
		const responseObj = {
			id: ttgfatbObj._id,
			time: ttgfatbObj.time,
			day: ttgfatbObj.dayID
		};
		res.status(200).json({'ttgfatb': responseObj});
	});
});

ttgfatbs.put('/:ttgfatb_id', function(req, res) {
	const ttgfatb = {
		id: req.params.ttgfatb_id,
		time: req.body.ttgfatb.time,
		day: req.body.ttgfatb.dayID
	};

    TtgfatbModel.update({
        _id: req.params.ttgfatb_id,
        owner: req.jwt.username
    }, {
        $set: ttgfatb
    }, function(err, ttgfatbObj) {
        if (err) {
            return res.sendStatus(500);
        } else {

            const responseObj = {
				id: ttgfatbObj._id,
				time: ttgfatbObj.time,
				day: ttgfatbObj.dayID
            };
            res.status(200).json({
                ttgfatb: responseObj
            });
        }
    });
});

module.exports = ttgfatbs;
