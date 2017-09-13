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

describe('Oauth2', function () {
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

    it('should login a user providing client credentials', (done) => {
        request(app)
            .post('/api/v1/oauth2/token')
            .send({
                grant_type: 'password',
                client_id: '58ebff810012ff1c85fa1900',
                client_secret: 'client_secret',
                username: 'user@gmail.com',
                password: 'pass'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data.identity).to.be.an('object');
                expect(res.body.access_token).to.be.a('string');

                done();
            });
    });

    it('should login a user with an app token', (done) => {
        request(app)
            .post('/api/v1/oauth2/token')
            .set('Authorization', 'Bearer APP_TOKEN')
            .send({
                grant_type: 'password',
                username: 'user@gmail.com',
                password: 'pass'
            })

            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data.identity).to.be.an('object');
                expect(res.body.access_token).to.be.a('string');

                done();
            });
    });

    it('should login an app', (done) => {
        request(app)
            .post('/api/v1/oauth2/token')
            .send({
                grant_type: 'client_credentials',
                client_id: '58ebff810012ff1c85fa1900',
                client_secret: 'client_secret'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data.identity).to.be.an('object');
                expect(res.body.access_token).to.be.a('string');

                done();
            });
    });
});
