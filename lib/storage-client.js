const Database = require('turtle-orm').Database;
const crypto = require('crypto');

module.exports = {
    dropDatabase: () => { return Database.getInstance().dropDatabase() },
    connectEnvironment: (env) => {
        let connectionInfo = {
            dialect: 'mongodb'
        };

        switch (env) {
            case 'test':
                var d = new Date();
                var hex = crypto.createHash('md5').update(d.getMilliseconds().toString()).digest('hex');

                connectionInfo.host = 'localhost';
                connectionInfo.db = 'tr2_mock_' + d.getTime() + '_' + hex.substr(0, 3);
                break;
            case 'production':
                // TODO put production info
                connectionInfo.host = 'localhost';
                connectionInfo.db = 'tr2_test';
                break;
            default:
                connectionInfo.host = 'localhost';
                connectionInfo.db = 'tr2_test';
                break;
        }

        let database = Database.create(connectionInfo);

        return database.connectAndSync();
    }
};