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

describe('Users CRUD & Login', function () {
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

    it('should login a user', (done) => {
        request(app)
            .post('/api/v1/users/login')
            .send({
                username: 'user@gmail.com',
                password: 'pass'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data.user).to.be.an('object');
                expect(res.body.data.access_token).to.be.a('string');

                done();
            });
    });

    it('should create a user', (done) => {
        request(app)
            .post('/api/v1/users')
            .set('Authorization', 'Bearer APP_TOKEN')
            .send({
                username: 'user@gmail.com',
                password: 'pass'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('object');
                expect(res.body.data.username).to.equal('user@gmail.com');
                expect(res.body.data.password).to.be.an('undefined');

                done();
            });
    });

    it('should update a user', (done) => {
        request(app)
            .put('/api/v1/users/58ebff810012ff1c85fa1905')
            .set('Authorization', 'Bearer USER_TOKEN')
            .send({
                password: 'password',
                name: 'Name'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('object');
                expect(res.body.data.name).to.equal('Name');
                expect(res.body.data.password).to.be.an('undefined');

                done();
            });
    });

    it('should delete a user', (done) => {
        request(app)
            .delete('/api/v1/users/58ebff810012ff1c85fa1905')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('object');
                expect(res.body.data.name).to.equal('user');
                expect(res.body.data.username).to.equal('user@gmail.com');
                expect(res.body.data.password).to.be.an('undefined');

                done();
            });
    });

    it('should list users', (done) => {
        request(app)
            .get('/api/v1/users?sort=_id')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('array');
                expect(res.body.data[0].name).to.equal('user');
                expect(res.body.data[0].username).to.equal('user@gmail.com');
                expect(res.body.data[1].username).to.equal('user2@gmail.com');
                expect(res.body.data[2].username).to.equal('user3@gmail.com');
                expect(res.body.data[0].password).to.be.an('undefined');

                done();
            });
    });

    it('should read one user', (done) => {
        request(app)
            .get('/api/v1/users/58ebff810012ff1c85fa1906')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('object');
                expect(res.body.data.name).to.equal('user2');
                expect(res.body.data.username).to.equal('user2@gmail.com');
                expect(res.body.data.password).to.be.an('undefined');

                done();
            });
    });

    it('should throw an error when reading a non existing user', (done) => {
        request(app)
            .get('/api/v1/users/58ebff810012ff1c85fa1900')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(404);

                done();
            });
    });

    it('should list users using sort', (done) => {
        request(app)
            .get('/api/v1/users?sort=username,-name')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('array');
                expect(res.body.data[0].name).to.equal('user2');
                expect(res.body.data[0].username).to.equal('user2@gmail.com');
                expect(res.body.data[1].username).to.equal('user3@gmail.com');
                expect(res.body.data[2].username).to.equal('user@gmail.com');
                expect(res.body.data[0].password).to.be.an('undefined');

                done();
            });
    });

    it('should list users projecting fields and sorting', (done) => {
        request(app)
            .get('/api/v1/users?sort=username,-name&fields=username,_id')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('array');
                expect(res.body.data[0].name).to.be.an('undefined');
                expect(res.body.data[0].username).to.equal('user2@gmail.com');
                expect(res.body.data[0].name).to.be.an('undefined');
                expect(res.body.data[0].password).to.be.an('undefined');
                expect(res.body.data[1].username).to.equal('user3@gmail.com');
                expect(res.body.data[1].name).to.be.an('undefined');
                expect(res.body.data[2].username).to.equal('user@gmail.com');
                expect(res.body.data[2].name).to.be.an('undefined');

                done();
            });
    });

    it('should list users projecting fields, sorting and limit', (done) => {
        request(app)
            .get('/api/v1/users?sort=username,-name&fields=username,_id&limit=2')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.equal(2);
                expect(res.body.data[0].name).to.be.an('undefined');
                expect(res.body.data[0].username).to.equal('user2@gmail.com');
                expect(res.body.data[0].name).to.be.an('undefined');
                expect(res.body.data[0].password).to.be.an('undefined');
                expect(res.body.data[1].username).to.equal('user3@gmail.com');
                expect(res.body.data[1].name).to.be.an('undefined');

                done();
            });
    });

    it('should list users projecting fields, sorting, limit and page', (done) => {
        request(app)
            .get('/api/v1/users?sort=username,-name&fields=username,_id&limit=2&page=2')
            .set('Authorization', 'Bearer ADMIN_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);

                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.equal(1);
                expect(res.body.data[0].username).to.equal('user@gmail.com');
                expect(res.body.data[0].name).to.be.an('undefined');

                done();
            });
    });

    it('should not be able to update another user', (done) => {
        request(app)
            .put('/api/v1/users/58ebff810012ff1c85fa1905')
            .set('Authorization', 'Bearer USER2_TOKEN')
            .send({
                password: 'password',
                name: 'Name'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(403);

                done();
            });
    });

    it('should not be able to read another user', (done) => {
        request(app)
            .put('/api/v1/users/58ebff810012ff1c85fa1905')
            .set('Authorization', 'Bearer USER2_TOKEN')
            .send({
                password: 'password',
                name: 'Name'
            })
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(403);

                done();
            });
    });

    it('should be able to read its own user', (done) => {
        request(app)
            .get('/api/v1/users/58ebff810012ff1c85fa1905')
            .set('Authorization', 'Bearer USER_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(200);
                expect(res.body.data.username).to.equal('user@gmail.com');

                done();
            });
    });

    it('should not be able to list users', (done) => {
        request(app)
            .get('/api/v1/users')
            .set('Authorization', 'Bearer USER_TOKEN')
            .end(function (err, res) {
                // console.log(res.toJSON());

                expect(err).to.be.a('null');
                expect(res.status).to.equal(403);

                done();
            });
    });
});
