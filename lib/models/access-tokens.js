const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;

const schema = {
    accessToken: { type: Types.STRING, required: true },
    userRole: { type: Types.STRING, required: true },
    userId: { type: Types.OBJECT_ID, required: true },
    expiresAt: { type: Date }
};

const schemaOptions = {
    versionKey: false
};

const indexes = [
    { accessToken: 1 }
];

module.exports = ModelFactory.model('access_tokens', schema, schemaOptions, indexes);