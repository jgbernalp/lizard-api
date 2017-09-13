//const Crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');

const SALT_ROUNDS = 8;
const DEFAULT_ALGO = 'aes-256-ctr';
const SECRET = '7DnLPNKVkshrB6rJLQYEtrdgh6wDk4N2aeZA2Gt5auJQSM3tnnwj3ngyVqBXCzvuqUPBuDHX7ffUZHxWhXMnMzYbbzNHJxjMaKuCX2cjpq7cbDZCXvCha94eZjXRauar4Uwt4Sj7MhZq5kVBNdxLdnMTvdYt4jQ87hhBhfNTP3pP68B9xKupvbnfZvDCGy224cuNGt7hrH2WrPBf8gqxjpH8f7AZwNxtHYvc9UKpq7v75CBXUZW6WynxuFFPCyrYhrEeVRBNHjhCCu64WGhqnEzRNAPA5sPJFSH7PTLgdczU9TwNdFybwaVmXZuw4CGxF2g2RBXfQwpv8j5RaNeStMzmbNbRPWHLwqJNzpYw6WGBcG4tMVJ6Pbggrnk6wWVAGES7mBS9d34L2YcGbuAdMULs7UGyrmPvRzmrLhLYvSMfZcyR4Vw54SzKwhQ2QTGYD3qAE366DTBk862P7kbGjqBVjumgv3yVAYwPRws4BQXUXmh9nd8j2AkddpXGHBYmFVnf2sFnVdGEXEMB77UEMDzLtXX2Jm2gbumTxxRAAXMS3V4x7XJ8R4sJRSfc9AsAPN5kPyYs99XFtQYCxHzjcYAM7cXDBbKa4QeAFKk39ZutTUCT5cB7xhVdNjuEGCbd5Tf3rUDNE4FrbHJR2MBKa3akwQQppV266PU84LvnHd9ZBLmW6DHL4Lpe3FHknxkjJTKYcg8fzBjJrnkxQaEuEjrfVqXg3NYuZWTP9vukhRqnx9ZB6VZLZxafeSumweNWcHFbDhtUDVLnQw2SmWmBeQyLcev5ZRRuppzyDCD7tGamGQBGgrQnskt4YcNkYZ7fGW5pCrENJUQXhnuAMYJkCmzTwrQybPbd3LvMtJc5zZ5FCZQeys2fyU8mh7m8khzhdsmcMpau4vmFFbxQeGXzAQFFJG8Ce5frdxGAzMjtxguuZgumd7NrVm9L2K9dDyTtggWKNJe9s29jCyGCTv4n5QCmdwnnNQyDkyWy9yHxMPVNYJTbdrXvmNHy59B2jLXyYszxgsnrSpsWXM8sYBK4QEhAzP2YGWPFhjVtzdFnkWewG42Frmd8cpjyRQNAHVddj3jwaLAtKrBANLpeefpCUeFGFJNaqvrxanmUbY52B6N7xdHKHKEPHF2NaGBCwJ6K5MGXn3rFVJNQ3MsrVs7r58f2qLSmFVawrwGjvhHZe3sVw22fNwGqaTdJcbjY7AKWCPC9zCzD7hWk2FnSLUEMsJz5Wx3XadjbrSg2u3A4eKbXc8szdxpZxL53HsHCR8S4mBFXmtSDFcS6sKA7ZEyfNkcrXt2x7fzRjYqmgBGNB8qGaKGruVHKPX3MK2L6uEA3yShKWuCFeJsAWNNeVTtj2mpVb8HfZUFZbGBAb63SnMSgAyCtnPumkJYuVtd5tJYC6vPF46QZc8AqSqvSwS8gRZpRDqgLXHse6Kp6FTWSXdaWtszNHjP3uJcC6TRcvrMk4rWnCTefEx8XM85SHQ28j6pcX5tL4GCjxBMwLEp9xXbTMrQbVpkvzDwvmshAEyNjHkmWJZ3Up4x7PFaEWYv3UY32tcdvR2BtUhM6ehDqBmtSVsB2k35aVNHY5A7etMUASLBbjSeaJjY53tvFtzH2aGNcgKDFHzv7J7668zBcca4aqQASN9GZhN5cZ3t5tfwhCHwyefutnsecwPYaVGh8Uyv8svEc2ynuk4GMv2X3ms43TC3LQGpwJYhqDHkLS3Yg9CX3nGaGAgy6qvNcD6AjwvjxGGzd3bDqMq6RWbTqu45aupGb2kMWTgY9y6WDyT3gzzEQDTQJN9EnXqH9Dhmn7bK85Db3vgvFLsmrHZZx8exkqvWfm8nxgRe7RDuy87eMjcX8FvnzcdPNdK8zrxApaxXxmdpzj6u5YkCzHyy65FrB9SjscxdDLRYtGW7CtfGMwzEabEFgrnje93Z7z3aMwZZxbUBRYjLnhdcDJp9ZNJTNam8pVun7BLgBz67AX2yydD98bdRkqa3C';

module.exports = {
    hashPassword: function (text) {
        return bcrypt.hashSync(text, bcrypt.genSaltSync(SALT_ROUNDS));
    },
    checkPassword: function (text, hashed, callback) {
        return bcrypt.compare(text, hashed, callback);
    },
    /*encrypt: function (text) {
        var cipher = Crypto.createCipher(DEFAULT_ALGO, SECRET);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },
    decrypt: function (text) {
        var decipher = Crypto.createDecipher(DEFAULT_ALGO, SECRET);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },
    md5: function (text) {
        var hash = Crypto.createHash('md5');
        return hash.update(text).digest('hex');
    },
    sha1: function (text) {
        var hash = Crypto.createHash('sha1');
        return hash.update(text).digest('hex');
    }*/
};