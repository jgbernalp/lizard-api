const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;
const Crypt = require('../crypt');

const schema = {
  username: {
    type: Types.STRING,
    set: (val) => val.toLowerCase(),
    required: true
  },
  password: {
    type: Types.STRING,
    set: (val) => Crypt.hashPassword(val),
    select: false,
    required: true
  },
  name: { type: Types.STRING, required: true },
  roles: { type: [Types.STRING], default: ['default'] },
  facebookId: Types.STRING,
  googleId: Types.STRING,
  active: { type: Types.BOOLEAN, default: true },
  recoveryCode: { type: Types.STRING },
  recoveryCodeExpiration: { type: Types.NUMBER }
};

const schemaOptions = {
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
    }
  }
};

const indexes = [
  { username: 1, password: 1 }
];

module.exports = ModelFactory.model('users', schema, schemaOptions, indexes);