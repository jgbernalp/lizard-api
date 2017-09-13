const Database = require('turtle-orm').Database;
const crypto = require('crypto');

module.exports = {
    dropDatabase: () => {
        const database = Database.getInstance();

        if (database) {
            return database.dropDatabase();
        }

        return Promise.resolve();
    },
    connectEnvironment: (env) => {
        let connectionInfo = {
            dialect: 'mongodb'
        };

        switch (env) {
            case 'test':
                var d = new Date();
                var hex = crypto.createHash('md5').update(d.getMilliseconds().toString()).digest('hex');

                connectionInfo.host = 'localhost';
                connectionInfo.db = 'lizard_mock_' + d.getTime() + '_' + hex.substr(0, 3);
                break;
            case 'production':
                // TODO put production info
                connectionInfo.host = 'localhost';
                connectionInfo.db = 'lizard_mock_test';
                break;
            default:
                connectionInfo.host = 'localhost';
                connectionInfo.db = 'lizard_mock_test';
                break;
        }

        let database = Database.create(connectionInfo);

        return database.connectAndSync();
    }
};