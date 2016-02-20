'use strict';

const crypto = require('crypto');

const config = require('../config');

const hashPassword = function(password, salt) {
    return crypto.createHash('sha512').update(password + salt).digest('hex');
};

const md5Hash = function(value, salt) {
    return crypto.createHash('md5').update(value + (salt ? salt: '')).digest('hex');
};

const createChecksum = function(day) {
    // Remove checksum
    delete day.checksum;
    
    const objString = JSON.stringify(day);
    
    const timestamp = Date.now().toString();
    const objHash = md5Hash(objString);
    
    const checkSum = timestamp + objHash;
    
    day.checksum = checkSum + md5Hash(checkSum, config.checkSumSalt).substring(0, 8);
    
    return day;
};

const validateChecksum = function (checksum) {
    const checkString = checksum.substring(0, checksum.length - 8);
    return (md5Hash(checkString, config.checkSumSalt).substring(0, 8) === checksum.substring(checksum.length - 8, checksum.length));
};

exports.md5Hash = md5Hash;
exports.createChecksum = createChecksum;
exports.hashPassword = hashPassword;
exports.validateChecksum = validateChecksum;
