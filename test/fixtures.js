var fs = require('fs');
var p = require('path');

var EJSON = require('mongodb-extended-json');
var storage = require('../lib/storage-client');

// Remove testing DB on test error or test stop by user
process.on('exit', function () {
    clearFixtures();
});

function insertCollection(modelName, data, Model) {
    return new Promise((resolve, reject) => {
        // Clear existing collection

        Model.remove().then(() => {
            var promises = [];

            // Insert each item individually so we get Mongoose validation etc.
            data.forEach(function (item) {
                try {
                    item = EJSON.parse(JSON.stringify(item));
                    let doc = Model.create(item);
                    doc.updatedAt = doc.createdAt = new Date();

                    promises.push(doc.save());
                } catch (err) {
                    console.error('Fixtures Error in object: ' + JSON.stringify(item));
                    return reject(err);
                }
            });

            return resolve(Promise.all(promises));
        }).catch(reject);
    });
}

function clearFixtures() {
    return storage.dropDatabase();
}

function loadFixtures(fileName) {
    return new Promise((resolve, reject) => {
        const parsedPath = p.parse(fileName);
        const path = parsedPath.dir + p.sep + 'fixtures' + p.sep + parsedPath.name + '.json';

        let modelIntances = {};

        const models = fs.readdirSync(p.join(__dirname, '/../lib/models'));

        models.forEach(function (it) {
            let modelInstance = require('../lib/models/' + it);
            modelIntances[modelInstance.name] = modelInstance;
        });

        if (fs.existsSync(path)) {
            const mockDB = require(path);
            let promises = [];

            for (let collection in mockDB) {
                promises.push(insertCollection(collection, mockDB[collection], modelIntances[collection]));
            }

            return resolve(Promise.all(promises));
        } else {
            return reject(new Error('Fixtures Error: Fixture file does not exist: ' + path));
        }
    });
}

module.exports = {
    loadFixtures: loadFixtures,
    clearFixtures: clearFixtures
};