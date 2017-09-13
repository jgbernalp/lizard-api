const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;
const Crypt = require('../crypt');

const schema = {
  secret: {
    type: Types.STRING,
    required: true
  },
  name: {
    type: Types.STRING,
    required: true
  }
};

const schemaOptions = {
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.secret;
    }
  }
};

const indexes = [
  { secret: 1 }
];

module.exports = ModelFactory.model('apps', schema, schemaOptions, indexes);