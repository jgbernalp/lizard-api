process.env.ENVIRONMENT = 'test';

const request = require('supertest');
const expect = require('chai').expect;
const Sinon = require('sinon');
const Users = require('../../lib/models/users');
const AccessTokens = require('../../lib/models/access-tokens');
const Storage = require('../../lib/storage-client');
const Crypt = require('../../lib/crypt');
const AuthorizationManager = require('../../lib/authorization-manager');

require('mocha-sinon');

const fixtures = require('./../fixtures');

const app = require('../../app');

describe('Core', function () {
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

    it('should create a valid user model with a hashed password', (done) => {
        let user = Users.create({
            username: 'test@gmail.com',
            password: 'password'
        });

        expect(user.username).to.equal('test@gmail.com');

        Crypt.checkPassword('password', user.password, (err, isValid) => {
            expect(isValid).to.equal(true);
            done();
        });
    });

    it('should validate an access_token', (done) => {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'user@gmail.com',
                password: 'pass'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(401);

                done();
            });
    });

    it('should remove old access tokens', (done) => {
        this.sinon.stub(AuthorizationManager, 'getRandomNumber').callsFake(() => {
            return 0.8;
        });

        AuthorizationManager.clearOldAccessTokens().then((response) => {
            AccessTokens.findOne({ query: { accessToken: 'OLD_TOKEN' } }).then(token => {
                expect(token).to.be.a('null');
                done();
            });
        });
    });

    it('should validate a string access_token', (done) => {
        request(app)
            .post('/api/v1/users')
            .send({
                username: 'user@gmail.com',
                password: 'pass',
                access_token: { invalid: true }
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(401);

                done();
            });
    });

    it('should handle invalid paths', (done) => {
        request(app)
            .post('/api/v1/users/something/non/existent')
            .send({
                username: 'user@gmail.com',
                password: 'pass',
                access_token: { invalid: true }
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(404);

                done();
            });
    });
});
