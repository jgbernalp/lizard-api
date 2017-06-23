const acl = require('./acl-config');
const AuthHeader = require('auth-header');
const HTTPError = require('./http-error');
const AccessTokens = require('./models/access-tokens');

class AuthorizationManager {
  static isAuthorized(req, res, next) {
    const accessToken = AuthorizationManager.parseAccessToken(req);

    if (!accessToken) {
      return next(new HTTPError(401, 'Undefined access_token', 100));
    }

    // TODO Handle access token expiration
    // TODO Handle enabled tokens
    AccessTokens.findOne({ query: { accessToken: accessToken } }).then((token) => {
      if (!token) {
        return next(new HTTPError(401, 'Invalid access_token', 100));
      }

      const action = AuthorizationManager.methodToAction(req.method);

      acl.areAnyRolesAllowed(token.userRole, req.resource, action, (err, allowed) => {
        if (err) return next(err);

        if (!allowed) {
          return next(new HTTPError(403, 'You are not authorized to perform this action on this resource'));
        }

        req.token = token;

        next();
      });
    }).catch(next);
  }

  static parseAccessToken(req) {
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