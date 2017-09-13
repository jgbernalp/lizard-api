const Notifications = require('../models/notifications');
const UserDevices = require('../models/user-devices');
const NotificationsManager = require('../notifications-manager');
const CRUDController = require('../controllers/crud-controller');
const HTTPError = require('../http-error');

class NotificationsController extends CRUDController {
  constructor() {
    super(Notifications);

    this.router.post('/registerDevice',
      this._changeScope(this, 'registerDevice'),
      this._changeScope(this, 'end')
    );

    this.router.post('/deregisterDevice',
      this._changeScope(this, 'deregisterDevice'),
      this._changeScope(this, 'end')
    );
  }

  deregisterDevice(req, res, next) {
    if (!req.token) {
      return next(new HTTPError(401, 'Invalid access token'));
    }

    if (!req.body.deviceType) {
      return next(new HTTPError(401, 'Device type is required'));
    }

    if (req.body.deviceType != 'ios' || req.body.deviceType != 'android') {
      return next(new HTTPError(401, 'Invalid device type'));
    }

    const userId = req.token.userId;
    const type = req.body.deviceType;

    UserDevices.remove({ query: { userId: userId, type: type } }).then(device => {
      res.response = { message: 'Device deregistered succesfully' };
      next();
    }).catch(next);
  }

  registerDevice(req, res, next) {
    if (!req.token) {
      return next(new HTTPError(401, 'Invalid access token'));
    }

    if (!req.body.deviceToken) {
      return next(new HTTPError(401, 'Device token is required'));
    }

    if (!req.body.deviceType) {
      return next(new HTTPError(401, 'Device type is required'));
    }

    if (req.body.deviceType != 'ios' || req.body.deviceType != 'android') {
      return next(new HTTPError(401, 'Invalid device type'));
    }

    const userId = req.token.userId;
    const token = req.body.deviceToken;
    const type = req.body.deviceType;

    UserDevices.findOne({ query: { userId: userId, type: type } }).then(device => {
      if (device) {
        device.token = token;
        device.save().then(() => {
          res.response = { message: 'Device token updated succesfully' };

          next();
        }).catch(next);
      } else {
        UserDevices.create({
          userId: userId,
          type: type,
          token: token
        }).save().then(() => {
          res.response = { message: 'Device registered succesfully' };

          next();
        }).catch(next);
      }
    }).catch(next);
  }

  afterCreate(req, res, next) {
    if (res.createdResource) {
      NotificationsManager.sendNotification(res.createdResource).then(notificationResponse => {
        if (!notificationResponse || !notificationResponse.sent) {
          return next(new HTTPError(500, 'error sending notification', notificationResponse))
        }

        res.response = Utils.merge(res.response || {}, { message: 'Notification sent' });

        next();
      }).catch(next);
    } else {
      super.afterCreate(req, res, next);
    }
  }
}

module.exports = new NotificationsController();