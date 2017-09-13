const HTTPError = require('./http-error');
const MailgunClient = require('./external/mailgun');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

let clients = [];

class EmailClient {
    static addClient(client, config) {
        switch (client) {
            case 'mailgun':
                clients.push({ name: client, client: MailgunClient.createClient(config) });
                break;
        }
    }

    static send({ email, subject, senderName, senderEmail, text, html, template, data, client }) {
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

            if (template) {
                const templatePath = path.join('..', 'email-templates', template);

                if (fs.existsSync(templatePath)) {
                    fs.readFile(templatePath, function (err, buf) {
                        let templateContent = hbs.handlebars.compile(buf.toString(), { data: data });

                        currentClient.send({ email, subject, senderName, senderEmail, text, templateContent })
                            .then(resolve)
                            .catch(reject);
                    });
                } else {
                    return reject(new Error('Invalid template path: ' + templatePath));
                }
            } else {
                currentClient.send({ email, subject, senderName, senderEmail, text, html })
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
}

module.exports = EmailClient;