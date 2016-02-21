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
            events: [0,1,2,3,4,5],
            timeToGetFromAtoB: [],
            sequence: []
        };
        
        dayLib.sortDay(testDay, function (seq) {
            console.log(seq);
            done();
        });
    });
});