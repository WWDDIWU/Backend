'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const utils = require('../lib/utils');
const userRoute = require('./users');
const userModel = require('../models/user');

const config = require('../config');

const api = express.Router();

api.use('users', userRoute);

api.get('/', function(req, res) {
    res.json({message: 'hi'});
});

api.post('authenticate', function(req, res) {
   if (req.body.email && req.body.password) {
       userModel.findOne({
           email: req.body.email
       }, 'userId email salt password', function(err, usr) {
           if (utils.hashPassword(req.body.password, usr.salt) === usr.password) {
               
                const user = {
                   userId: usr.userId,
                   name: usr.name,
                   lastName: usr.lastName,
                   email: req.body.email
                };
                
                const token = jwt.sign(user, config.jwtSecret, {
                  expiresInMinutes: 43200 // expires in 30 days
                });
                
                res.json({token: token});
          } else {
              res.sendStatus(401);
          }
       });
   } else {
       res.sendStatus(400);
   } 
});

module.exports = api;