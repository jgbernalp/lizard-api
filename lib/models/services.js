const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;

const schema = {
    name: { type: Types.STRING, required: true },
    token: { type: Types.STRING, required: true },
    userId: { type: Types.OBJECT_ID, required: true }
};

const schemaOptions = {
    versionKey: false
};

const indexes = [
    { userId: 1 }
];

module.exports = ModelFactory.model('user_devices', schema, schemaOptions, indexes);