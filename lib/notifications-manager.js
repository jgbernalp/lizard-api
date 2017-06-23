const HTTPError = require('../http-error');
const EmailClient = require('../email-client');
const config = require('../config/config');


class NotificationsManager {
    static sendNotification({ type, text, html, receiver, receiverId, subject }) {
        if (receiverId == undefined) {
            if (!receiver || !receiver.username) {
                return reject(new HTTPError(400, 'Invalid receiver'));
            }
        }

        return new Promise((resolve, reject) => {
            switch (type) {
                case 'email':
                    const mailConfig = config.mailing;

                    if (receiver == undefined) {
                        Users.findById({ id: receiverId }).then(user => {
                            if (!user) {
                                return reject(new HTTPError(400, 'Invalid receiverId'));
                            }

                            EmailClient.send({
                                email: user.username,
                                subject: subject || mailConfig.defaultSender.subject,
                                senderName: mailConfig.defaultSender.name,
                                senderEmail: mailConfig.defaultSender.email,
                                text,
                                html
                            }).then(response => {
                                resolve({ sent: response.success });
                            }).catch(reject);
                        });
                    } else {
                        EmailClient.send({
                            email: receiver.username,
                            subject: subject || mailConfig.defaultSender.subject,
                            senderName: mailConfig.defaultSender.name,
                            senderEmail: mailConfig.defaultSender.email,
                            text,
                            html
                        }).then(response => {
                            resolve({ sent: response.success });
                        }).catch(reject);
                    }
                    break;
                case 'mobile-push':
                    // TODO send push notification based on user device
                    resolve({ sent: true });
                    break;
                default:
                    reject(new Error('Invalid type for notification'));
                    break;
            }
        });
    }
}

module.exports = NotificationsManager;