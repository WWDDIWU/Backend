"use strict";

const fs = require('fs');
const path = require('path');

const mocha = require('mocha');
const should = require('should');

const dayLib = require("../lib/day");

describe('Test Day Sorting', function () {
    it ('should bla', function(done) {
        const testDay = {
            owner: 1,
            date: Date('2016-02-20'),
            checksum: 'aaaaaaaaaaaaaaaaaaaaaaaa',
            events: [0,1,2,3],
            timeToGetFromAtoB: [],
            sequence: []
        };
        
        const testEvents = [
            {
                eventID: 1,
                type: 0,
                priority: 0,
                title: "Test Event Termin",
                time: {
                    start: "08:00",
                    end: "17:00"
                },
                description: "",
                location: 2,
                suggestion: false
            },{
                eventID: 8,
                type: 1,
                priority: 1,
                title: "Test Event Aufgabe",
                time: {
                    duration: 45
                },
                description: "",
                location: 2,
                suggestion: false
            },{
                eventID: 12,
                type: 0,
                priority: 2,
                title: "Test Event Termin 2",
                time: {
                    start: "22:00",
                    end: "23:00"
                },
                description: "",
                location: 1,
                suggestion: false
            },{
                eventID: 36,
                type: 1,
                priority: 2,
                title: "Test Event Aufgabe",
                time: {
                    duration: 70
                },
                description: "",
                location: 1,
                suggestion: false
            }
        ];
        
        const testLocations = [
            {
                locationID: 1,
                name: "Gablenberger Haupstr.",
                latitude: 48.776538,
                longitude: 9.203572
            }, {
                locationID: 2,
                name: "DHBW",
                latitude: 48.7846616,
                longitude: 9.1721437
            }
        ];
        dayLib.sortDay(testDay, function (seq) {
            console.log(seq);
            done();
        });
    });
});