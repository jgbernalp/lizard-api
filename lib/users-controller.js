const express = require('express');
const utils = require('../utils');
const HTTPError = require('../http-error');
const Users = require('../models/users-model');
const AccessTokens = require('../models/access-tokens-model');
const AuthorizationManager = require('../authorization-manager');

class UserController extends CRUDController {
  constructor() {
    super(Users);
  }
}

module.exports = new UserController();