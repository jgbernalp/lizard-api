const express = require('express');
const HTTPError = require('../http-error');
const Users = require('../models/users');
const AccessTokens = require('../models/access-tokens');
const Crypt = require('../crypt');
const Utils = require('../utils');
const CRUDController = require('../controllers/crud-controller');
const AuthorizationManager = require('../authorization-manager');
const NotificationsManager = require('../notifications-manager');
const config = require('../config/config');

class UserController extends CRUDController {
  constructor() {
    super(Users);

    this.router.post('/login',
      this._changeScope(this, 'login'),
      this._changeScope(this, 'end')
    );

    this.router.post('/recoverPassword',
      this._changeScope(this, 'recoverPassword'),
      this._changeScope(this, 'end')
    );

    this.router.post('/resetPassword',
      this._changeScope(this, 'resetPassword'),
      this._changeScope(this, 'end')
    );
  }

  resetPassword(req, res, next) {
    if (!req.body.recoveryCode || req.body.recoveryCode.length == 0) {
      return next(new HTTPError(400, 'Invalid recoveryCode'));
    }

    if (!req.body.password || req.body.password.length == 0) {
      return next(new HTTPError(400, 'Invalid password'));
    }

    const recoveryCode = req.body.recoveryCode;
    const password = req.body.password;

    // TODO check expired recovery codes

    Users.findOne({ query: { recoveryCode: recoveryCode } }).then(user => {
      if (!user) {
        return next(new HTTPError(400, 'Invalid recoveryCode'));
      }

      user.password = password;
      user.save().then(() => {
        res.response = { message: 'New password saved succesfully, please login' };

        next();
      }).catch(next);
    }).catch(next);
  }

  recoverPassword(req, res, next) {
    if (!req.body.username || req.body.username.length == 0) {
      return next(new HTTPError(400, 'Invalid username'));
    }

    const username = req.body.username;
    const recoveryCode = Utils.generateUUID(128);

    Users.findOne({ query: { username: username } }).then(user => {
      if (!user) {
        return next(new HTTPError(404, 'User not found'));
      }

      user.recoveryCode = recoveryCode;
      user.save().then(() => {
        const link = `${config.passwordRecovery.resetLink}?c=${recoveryCode}`;
        // TODO build simple template system
        const html = `<html>
          <body>
            <p>
            To recover your password click <a target="_blank" href="${link}">here</a> 
            or copy & paste the folllowing link: 
            <br/>
            <a target="_blank" href="${link}">${link}</a>
            </p>
          </body>
        </html>`

        NotificationsManager
          .sendNotification({
            type: 'email',
            html: html,
            receiver: user,
            subject: config.passwordRecovery.subject || 'Recovery Code'
          })
          .then(emailResponse => {
            if (!emailResponse || !emailResponse.sent) {
              return next(new HTTPError(500, 'Error sending recovery code', emailResponse));
            }

            res.response = { message: 'Recovery code sent to: ' + user.username };

            next();
          }).catch(next);
      }).catch(next);
    }).catch(next);
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

      Crypt.checkPassword(req.body.password, user.password, (err, isValid) => {
        if (err) return next(err);

        if (!isValid) {
          return next(new HTTPError(400, 'Invalid credentials'));
        }

        const accessToken = Utils.generateUUID(128);

        let expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (3600 * 1000));

        // TODO support multiple roles

        AuthorizationManager.clearOldAccessTokens();

        AccessTokens.create({
          userId: user._id,
          userRole: user.roles[0],
          accessToken: accessToken,
          expiresAt: expirationDate
        }).save().then(newAccessToken => {
          res.response = { data: { access_token: accessToken, user: user } };

          next();
        }).catch(next);
      });
    }).catch(next);
  }
}

module.exports = new UserController();