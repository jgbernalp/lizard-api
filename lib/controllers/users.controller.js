const express = require('express');
const HTTPError = require('../http-error');
const Users = require('../models/users');
const AccessTokens = require('../models/access-tokens');
const Crypt = require('../crypt');
const Utils = require('../utils');
const CRUDController = require('../controllers/crud.controller');

class UserController extends CRUDController {
  constructor() {
    super(Users);

    this.router.post('/login',
      this._changeScope(this, 'login')
    );
  }

  beforeRead(req, res, next) {
    if (req.params.id) {
      if (req.token.userRole == 'default') {
        if (req.token.userId.toString() != req.params.id) {
          next(new HTTPError(403, 'You are not authorized to read this user'));
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      if (req.token.userRole == 'default') {
        next(new HTTPError(403, 'You are not authorized to read a list of users'));
      } else {
        next();
      }
    }
  }

  beforeUpdate(req, res, next) {
    if (req.token) {
      let userRole = req.token.userRole;

      if (userRole == 'default') {
        if (req.params.id.toString() == req.token.userId.toString()) {
          next();
        } else {
          next(new HTTPError(403, 'You are not authorized to update this user'));
        }
      } else {
        next();
      }
    } else {
      next(new HTTPError(401));
    }
  }

  login(req, res, next) {
    if (!req.body.username || req.body.username.length == 0) {
      return next(new HTTPError(400, 'Invalid username'));
    }

    if (!req.body.password || req.body.password.length == 0) {
      return next(new HTTPError(400, 'Invalid password'));
    }

    Users.findOne({ query: { username: req.body.username }, fields: '+password' }).then(user => {
      if (user == null) {
        return next(new HTTPError(400, 'Invalid credentials'));
      }

      if (user && user.password && Crypt.checkPassword(req.body.password, user.password)) {
        const accessToken = Utils.generateUUID(128);

        let expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + (3600 * 1000));

        // TODO support multiple roles

        AccessTokens.create({
          userId: user._id,
          userRole: user.roles[0],
          accessToken: accessToken,
          expiresAt: expireDate
        }).save().then(newAccessToken => {
          res.json({ data: { access_token: accessToken, user: user } });
        }).catch(next);
      } else {
        return next(new HTTPError(400, 'Invalid credentials'));
      }
    }).catch(next);
  }
}

module.exports = new UserController();