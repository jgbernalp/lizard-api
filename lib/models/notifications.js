const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;
const Crypt = require('../crypt');

const schema = {
  type: { type: Types.STRING, required: true }, // email, mobile-push, web-push, sms
  text: { type: Types.STRING, required: true },
  html: { type: Types.STRING },
  receiverUserId: { type: Types.OBJECT_ID, required: true },
  senderUserId: { type: Types.OBJECT_ID }
};

const schemaOptions = {
  versionKey: false
};

const indexes = [
  { receiverUserId: 1 },
  { senderUserId: 1 }
];

module.exports = ModelFactory.model('notifications', schema, schemaOptions, indexes);