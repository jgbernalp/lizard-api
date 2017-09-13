const BaseController = require('../controllers/base-controller');
const AuthorizationManager = require('../authorization-manager');
const HTTPError = require('../http-error');
const Users = require('../models/users');
const AccessTokens = require('../models/access-tokens');
const Apps = require('../models/apps');
const Crypt = require('../crypt');
const Utils = require('../utils');

class OAuth2Controller extends BaseController {
  constructor() {
    super();

    this.router.post('/token',
      AuthorizationManager.parseAccessToken,
      (req, res, next) => {
        req.action = 'token';
        next();
      },
      this._changeScope(this, 'token'),
      this._changeScope(this, 'end')
    );
  }

  token(req, res, next) {
    if (!req.body.grant_type) {
      return next(new HTTPError(400, 'Undefined grant_type'));
    }

    switch (req.body.grant_type) {
      case 'client_credentials': this.clientCredentials(req, res, next); break;
      case 'password': this.password(req, res, next); break;
      default: return next(new HTTPError(400, 'Unsupported grant_type')); break;
    }
  }

  createAccessToken(client, identity, identityType, res, next) {
    const accessToken = Utils.generateUUID(128);

    // TODO setup expiration time in config
    let expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (3600 * 3 * 1000));

    AuthorizationManager.clearOldAccessTokens();

    // TODO support multiple roles or role switching

    const role = identity && identity.roles && Array.isArray(identity.roles) ? identity.roles[0] : 'default';

    if (!identity.id) {
      return next(new HTTPError(500, 'Invalid identity id'));
    }

    AccessTokens.create({
      identityId: identity.id,
      identityRole: role,
      identityType: identityType,
      accessToken: accessToken,
      expiresAt: expirationDate,
      clientId: client.id,
    }).save().then(newAccessToken => {
      res.response = Utils.merge(res.response || {}, { access_token: accessToken, data: { identity } });

      next();
    }).catch(next);
  }

  clientCredentials(req, res, next) {
    if (!req.body.client_id || !req.body.client_secret) {
      return next(new HTTPError(400, 'Undefined client_id or client_secret'));
    }

    Apps.findById({ id: req.body.client_id, fields: 'secret', options: { lean: true } }).then(app => {
      if (app == null) {
        return next(new HTTPError(400, 'Invalid client'));
      }

      if (app.secret != req.body.client_secret) {
        return next(new HTTPError(400, 'Invalid client credentials'));
      }

      this.createAccessToken(app, app, 'apps', res, next);
    }).catch(next);
  }

  password(req, res, next) {
    let hasAppToken = false;

    if (req.token && req.token.identityType == 'apps') {
      hasAppToken = true;
      req.body.client_id = req.token.identityId;
    } else if (!req.body.client_id || !req.body.client_secret) {
      return next(new HTTPError(400, 'Undefined client_id or client_secret'));
    }

    if (!req.body.username || req.body.username.length == 0) {
      return next(new HTTPError(400, 'Undefined username'));
    }

    if (!req.body.password || req.body.password.length == 0) {
      return next(new HTTPError(400, 'Undefined password'));
    }

    Apps.findById({ id: req.body.client_id, fields: 'secret', options: { lean: true } }).then(app => {
      if (app == null) {
        return next(new HTTPError(400, 'Invalid client'));
      }

      if (!hasAppToken && app.secret != req.body.client_secret) {
        return next(new HTTPError(400, 'Invalid client credentials'));
      }

      Users.findOne({ query: { username: req.body.username }, fields: '+password', options: { lean: true } }).then(user => {
        if (user == null) {
          return next(new HTTPError(400, 'Invalid user credentials'));
        }

        Crypt.checkPassword(req.body.password, user.password, (err, isValid) => {
          if (err) return next(err);

          if (!isValid) {
            return next(new HTTPError(400, 'Invalid user credentials'));
          }

          this.createAccessToken(user, app, 'users', res, next);
        });
      }).catch(next);
    }).catch(next);
  }
}

module.exports = new OAuth2Controller();