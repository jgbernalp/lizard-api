module.exports = {


    mailing: {
        /*client: 'mailgun',
        config: {
            apiKey: 'XXXXXXXXXXXX',
            domain: 'yourdomain.com'
        },
        */
        defaultSender: {
            name: 'Your Company Name',
            email: 'no-reply@yourdomain.com',
            subject: 'Contact from Your Company Name'
        },
        registrationSubject: 'Welcome ${userName}',
        passwordRecovery: {
            subject: 'Recovery Code',
            resetLink: 'http://yourdomain.com/passwordReset',
            recoveryCodeLifetime: 172800
        }
    }
}