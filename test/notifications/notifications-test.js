process.env.ENVIRONMENT = 'test';

const Storage = require('../../lib/storage-client');
const request = require('supertest');
const expect = require('chai').expect;
const Sinon = require('sinon');
const Users = require('../../lib/models/users');
const Crypt = require('../../lib/crypt');

require('mocha-sinon');

const fixtures = require('./../fixtures');

const app = require('../../app');

describe('Notifications Test', function () {
    beforeEach((done) => {
        this.sinon = Sinon.sandbox.create();
        fixtures.loadFixtures(__filename).then(() => done());
    });

    afterEach(() => {
        this.sinon.restore();
    });

    after((done) => {
        fixtures.clearFixtures().then(() => done());
    });
});
