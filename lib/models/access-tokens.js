const ModelFactory = require('turtle-orm').ModelFactory;
const Types = require('turtle-orm').Types;

const schema = {
    accessToken: { type: Types.STRING, required: true },
    identityRole: { type: Types.STRING, required: true },
    identityId: { type: Types.OBJECT_ID, required: true },
    identityType: { type: Types.STRING, required: true },
    clientId: { type: Types.OBJECT_ID, required: true },
    expiresAt: { type: Date }
};

const schemaOptions = {
    versionKey: false
};

const indexes = [
    { accessToken: 1 },
    { expiresAt: -1 }
];

module.exports = ModelFactory.model('access_tokens', schema, schemaOptions, indexes);