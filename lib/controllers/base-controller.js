const express = require('express');

class BaseController {
  _changeScope(self, method) {
    return (req, res, next) => {
      self[method].call(self, req, res, next);
    }
  }

  constructor() {
    this.router = express.Router();
  }

  end(req, res, next) {
    if (res.statusCode == undefined) {
      res.statusCode = 200;
    }

    if (res.response === undefined) {
      res.response = {};
    }

    res.status(res.statusCode).json(res.response);
  }
}

module.exports = BaseController;