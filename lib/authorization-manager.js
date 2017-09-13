const acl = require('./acl-config');
const AuthHeader = require('auth-header');
const HTTPError = require('./http-error');
const AccessTokens = require('./models/access-tokens');

class AuthorizationManager {
  static parseAccessToken(req, res, next) {
    const accessToken = AuthorizationManager.getAccesstokenFromRequest(req);

    // TODO Handle access token expiration
    // TODO Handle enabled tokens

    if (accessToken) {
      AccessTokens.findOne({ query: { accessToken: accessToken } }).then((token) => {
        req.token = token;

        next();
      }).catch(next);
    } else {
      next();
    }
  }

  static isAuthorized(req, res, next) {
    AuthorizationManager.parseAccessToken(req, res, (error) => {
      if (error) return next(error);

      if (!req.token) {
        return next(new HTTPError(401, 'Invalid access_token', null, 100));
      }

      let action = AuthorizationManager.methodToAction(req.method);

      if (req.action) {
        action = req.action;
      }

      //console.log(req.token.identityRole, req.resource, action);

      acl.areAnyRolesAllowed(req.token.identityRole, req.resource, action, (err, allowed) => {
        if (err) return next(err);

        if (!allowed) {
          return next(new HTTPError(403, 'You are not authorized to perform this action on this resource'));
        }

        next();
      });
    });
  }

  static getAccesstokenFromRequest(req) {
    if (req.body && req.body.access_token && typeof req.body.access_token == 'string') {
      return req.body.access_token
    } else if (req.headers && req.headers.authorization && typeof req.headers.authorization == 'string') {
      let parsed = AuthHeader.parse(req.headers.authorization);
      if (parsed && parsed.token) {
        return parsed.token;
      }
    } else if (req.cookies && req.cookies.AT && typeof req.cookies.AT == 'string') {
      return req.cookies.AT;
    }

    return null;
  }

  static clearOldAccessTokens() {
    if (this.getRandomNumber() > 0.7) {
      const date = new Date();

      return AccessTokens.remove({ expiresAt: { $lt: date } });
    }

    return Promise.resolve({});
  }

  static getRandomNumber() {
    return Math.random();
  }

  static methodToAction(method) {
    let action = 'read';
    switch (method.toLowerCase()) {
      case 'get':
        action = 'read';
        break;
      case 'post':
        action = 'create';
        break;
      case 'put':
        action = 'update';
        break;
      case 'delete':
        action = 'delete';
        break;
    }

    return action;
  }
}

module.exports = AuthorizationManager;