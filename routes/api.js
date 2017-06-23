module.exports = function (app) {
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
