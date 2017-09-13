module.exports = function (app) {
  app.use('/api/v1/oauth2', function (req, res, next) {
    req.resource = 'oauth2';
    next();
  }, require('../lib/controllers/oauth2-controller').router);

  app.use('/api/v1/users', function (req, res, next) {
    req.resource = 'users';
    next();
  }, require('../lib/controllers/users-controller').router);

  app.use('/api/*', function (req, res) {
    res.status(404).json({
      message: 'Invalid Path'
    });
  });

  return app;
};
