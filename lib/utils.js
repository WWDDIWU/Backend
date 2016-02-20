'use strict';

const crypto = require('crypto');

exports.hash = function(password, salt) {
    return crypto.createHash('sha512').update(password + salt).digest('hex');
};
