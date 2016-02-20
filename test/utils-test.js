'use strict';

const mocha = require('mocha');
const should = require('should');

const utils = require('../lib/utils');

const config = require('../config');

describe('Test utils', function() {
    describe('Test password hash', function() {
        it('should hash a password', function() {
            const hash = utils.hashPassword('test', 'test');
            hash.should.be.equal('125d6d03b32c84d492747f79cf0bf6e179d287f341384eb5d6d3197525ad6be8' +
                'e6df0116032935698f99a09e265073d1d6c32c274591bf1d0a20ad67cba921bc');
        });
    });
    
    describe('test md5 hash', function() {
        it('should return md5 hash without salt', function() {
           const md5Hash = utils.md5Hash('test');
           md5Hash.should.be.equal('098f6bcd4621d373cade4e832627b4f6');
        });
        
        it('should return salted md5 hash', function() {
            const md5Hash = utils.md5Hash('test', 'test');
            md5Hash.should.be.equal('05a671c66aefea124cc08b76ea6d30bb');
        });
    });
    
    describe('test checksum', function() {
       it('should create a checksum', function() {
           const day = {
               dummyContent: 'dummy'
           };
           
           const checksumDay = utils.createChecksum(day);
           checksumDay.checksum.should.have.lengthOf(13 + 32 + 8);
           
           utils.validateChecksum(checksumDay.checksum).should.be.ok;
       }); 
    });
});