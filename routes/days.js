'use strict';

const express = require('express');
const mongoose = require('mongoose');

const DayModel = require('../models/day');

const days = express.Router();

days.get('/', function(req, res) {
    DayModel.find({
        owner: req.jwt.username
    }, function(err, dayObjects) {
        let responseObjects = [];
        dayObjects.forEach(function(e) {
            const obj = {
                id: e._id,
                owner: req.jwt.username,
                date: e.date,
                checksum: e.checksum,
                events: e.events,
                timeToGetFromAtoB: e.timeToGetFromAtoB,
                sequence: e.sequence
            };
            responseObjects.push(obj);
        });

        res.status(200).json({
            days: responseObjects
        });
    });
});

days.put('/:day_id', function(req, res) {
    const day = {
        id: req.params.day_id,
        owner: req.jwt.username,
        date: req.body.day.date,
        checksum: req.body.day.checksum,
        events: req.body.day.events,
        timeToGetFromAtoB: req.body.day.timeToGetFromAtoB,
        sequence: req.body.day.sequence
    };

    DayModel.update({
        _id: req.params.event_id,
        owner: req.jwt.username
    }, {
        $set: day
    }, function(err, dayObj) {
        if (err) {
            return res.sendStatus(500);
        } else {

            const responseObj = {
                id: dayObj._id,
                owner: req.jwt.username,
                date: dayObj.date,
                checksum: dayObj.checksum,
                events: dayObj.events,
                timeToGetFromAtoB: dayObj.timeToGetFromAtoB,
                sequence: dayObj.sequence
            };
            res.status(200).json({
                day: responseObj
            });
        }
    });
});

days.post('/', function(req, res) {
    const day = new DayModel({
        owner: req.jwt.username,
        date: req.body.day.date,
        checksum: req.body.day.checksum,
        events: req.body.day.events,
        timeToGetFromAtoB: req.body.day.timeToGetFromAtoB,
        sequence: req.body.day.sequence
    });

    day.save(function(err, dayObj) {
        if (err) {
            res.sendStatus(500);
        }

        const responseObj = {
            id: dayObj._id,
            owner: req.jwt.username,
            date: dayObj.date,
            checksum: dayObj.checksum,
            events: dayObj.events,
            timeToGetFromAtoB: dayObj.timeToGetFromAtoB,
            sequence: dayObj.sequence
        };

        res.status(200).json({
            day: responseObj
        });
    });
});

days.get('/:day_id', function(req, res) {
    DayModel.findOne({
        _id: req.params.day_id,
        owner: req.jwt.username
    }, function(err, day) {
        if (err) {
            return res.sendStatus(500);
        }

        const responseObj = {
            id: day._id,
            owner: req.jwt.username,
            date: day.date,
            checksum: day.checksum,
            events: day.events,
            timeToGetFromAtoB: day.timeToGetFromAtoB,
            sequence: day.sequence
        };

        res.status(200).json({
            day: responseObj
        });
    });
});

days.delete('/:day_id', function(req, res) {
    DayModel.findOne({
        _id: req.params.day_id,
        owner: req.jwt.usernam
    }).remove(function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(200);
    });
});

module.exports = days;
