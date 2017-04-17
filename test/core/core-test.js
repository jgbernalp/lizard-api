process.env.NODE_ENV = 'test';

const request = require('supertest');
const expect = require('chai').expect;
const Sinon = require('sinon');
const Users = require('../../lib/models/users');
const Storage = require('../../lib/storage-client');
const Crypt = require('../../lib/crypt');

require('mocha-sinon');

const fixtures = require('./../fixtures');

const app = require('../../app');

describe('Core', function () {
    it('should create a model', (done) => {
        let user = Users.create({
            username: 'test@gmail.com',
            password: 'password'
        });

        expect(user.username).to.equal('test@gmail.com');
        expect(Crypt.checkPassword('password', user.password)).to.equal(true);

        done();
    });
});
