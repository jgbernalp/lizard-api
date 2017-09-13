const express = require('express');
const HTTPError = require('../http-error');
const Users = require('../models/users');
const Apps = require('../models/apps');
const AccessTokens = require('../models/access-tokens');
const Crypt = require('../crypt');
const Utils = require('../utils');
const CRUDController = require('../controllers/crud-controller');
const AuthorizationManager = require('../authorization-manager');
const Oauth2Controller = require('./oauth2-controller');
const NotificationsManager = require('../notifications-manager');
const config = require('../config/config');

class UserController extends CRUDController {
  constructor() {
    super(Users);

    this.router.post('/register',
      (req, res, next) => {
        req.action = 'register';
        next();
      },
      AuthorizationManager.isAuthorized,
      this._changeScope(this, 'register'),
      this._changeScope(this, 'end')
    );

    this.router.post('/recoverPassword',
      (req, res, next) => {
        req.action = 'recover_password';
        next();
      },
      AuthorizationManager.isAuthorized,
      this._changeScope(this, 'recoverPassword'),
      this._changeScope(this, 'end')
    );

    this.router.post('/resetPassword',
      (req, res, next) => {
        req.action = 'reset_password';
        next();
      },
      AuthorizationManager.isAuthorized,
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
    const actualTimestamp = Date.now() / 1000;

    Users.findOne({
      query: {
        recoveryCode: recoveryCode,
        recoveryCodeExpiration: { $lt: actualTimestamp }
      }
    }).then(user => {
      if (!user) {
        return next(new HTTPError(400, 'Invalid recoveryCode'));
      }

      user.password = password;
      user.save().then(() => {
        res.response = { message: 'New password saved succesfully, you can now login' };

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

      let d = new Date();
      d.setTime(d.getTime() + config.mailing.passwordRecovery.recoveryCodeLifetime);

      user.recoveryCode = recoveryCode;
      user.recoveryCodeExpiration = d.getTime() / 1000;

      user.save().then(() => {
        const link = `${config.mailing.passwordRecovery.resetLink}?c=${recoveryCode}`;

        NotificationsManager.sendNotification({
          type: 'email',
          data: {
            link: link
          },
          template: 'recover-password',
          receiver: user,
          subject: config.mailing.passwordRecovery.subject || 'Recovery Code'
        }).then(emailResponse => {
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
    const userRole = req.token.identityRole;
    const userId = req.token.identityId;

    if (req.params.id) {
      if (userRole == 'default') {
        if (userId.toString() != req.params.id) {
          next(new HTTPError(403, 'You are not authorized to read this user'));
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      if (userRole == 'default') {
        next(new HTTPError(403, 'You are not authorized to read a list of users'));
      } else {
        next();
      }
    }
  }

  beforeUpdate(req, res, next) {
    if (!req.token) {
      return next(new HTTPError(401));
    }

    const userRole = req.token.identityRole;

    if (userRole == 'admin' || req.params.id.toString() == req.token.identityId.toString()) {
      return next();
    }

    return next(new HTTPError(403, 'You are not authorized to update this user'));
  }

  register(req, res, next) {
    if (!req.body.username || req.body.username.length == 0) {
      return next(new HTTPError(400, 'Invalid username'));
    }

    if (!req.body.password || req.body.password.length == 0) {
      return next(new HTTPError(400, 'Invalid password'));
    }

    if (!req.body.password || req.body.password.length == 0) {
      return next(new HTTPError(400, 'Invalid password'));
    }

    if (!req.token || !req.token.clientId) {
      return next(new HTTPError(401, 'Invalid access token for user registration'));
    }

    Apps.findById({ id: req.token.clientId, fields: '_id', options: { lean: true } }).then(client => {
      if (!client) {
        return next(new HTTPError(400, 'Invalid client'));
      }

      let expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + (3600 * 1000));

      Users.create(req.body).save().then(user => {
        Oauth2Controller.createAccessToken(client, user, 'users', res, err => {
          if (err) return next(err);

          const userName = user && user.name || '';

          let subject = 'Welcome ' + userName;

          // TODO build replacement helper with i18n
          if (config && config.mailing && config.mailing.registrationSubject) {
            subject = config.mailing.registrationSubject.replace('${userName}', userName);
          }

          NotificationsManager.sendNotification({
            type: 'email',
            template: 'registration',
            data: {
              userName: userName
            },
            receiver: user,
            subject: subject
          }).then(emailResponse => {
            res.response = Utils.merge(res.response || {}, { data: { email: emailResponse } });

            next();
          }).catch(next);
        });
      }).catch(next);
    }).catch(next);
  }
}

module.exports = new UserController();