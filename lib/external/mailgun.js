const Mailgun = require('mailgun-js');

class MailgunClient {
    constructor({ apiKey, domain }) {
        this.mailgun = Mailgun({ apiKey: apiKey, domain: domain });
    }

    send({ email, subject, senderName, senderEmail, text, html }) {
        return new Promise((resolve, reject) => {
            var data = {
                from: senderName + ' <' + senderEmail + '>',
                to: email,
                subject: subject,
                text: text,
                html: html
            };

            this.mailgun.messages().send(data, function (error, body) {
                if (error) {
                    return reject(error);
                }

                // TODO check sent success
                resolve({ success: true, raw: body });
            });
        })
    }
}

module.exports = MailgunClient;