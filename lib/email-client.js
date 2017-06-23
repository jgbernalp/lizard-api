const HTTPError = require('../http-error');
const MailgunClient = require('../external/mailgun');

let clients = [];

class EmailClient {
    static addClient(client, config) {
        switch (client) {
            case 'mailgun':
                clients.push({ name: client, client: MailgunClient.createClient(config) });
                break;
        }
    }

    static send({ email, subject, senderName, senderEmail, text, html, client }) {
        return new Promise((resolve, reject) => {
            let currentClient;

            if (clients.length == 0) {
                return reject(new Error('No clients have been configured'));
            }

            if (client == undefined) {
                currentClient = clients[0].client;
            } else {
                currentClient = clients.find(item => item.name == client);
                if (!currentClient) {
                    return reject(new Error('Invalid client'));
                }
            }

            currentClient.send({ email, subject, senderName, senderEmail, text, html })
                .then(resolve)
                .catch(reject);
        });
    }
}

module.exports = EmailClient;