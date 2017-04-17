class HTTPError extends Error {
    constructor(status, message, code) {
        super();

        this.status = status || 200;
        this.message = message;
        this.code = code;

        this.description = HTTPError.getHTTPDescription(this.status);
        Error.captureStackTrace(this, this.constructor);
    }

    static getHTTPDescription(status) {
        let description = 'OK';

        switch (status) {
            case 400:
                description = 'Bad Request';
                break;
            case 404:
                description = 'Not Found';
                break;
            case 401:
                description = 'Unauthorized';
                break;
            case 403:
                description = 'Forbidden';
                break;
            case 500:
                description = 'Server Error';
                break;
        }
    }

    toJSON(showStackTrace) {
        let object = {
            message: this.message
        };

        if (this.code) {
            object.code = this.code;
        }

        if (this.status) {
            object.status = this.status;
        }

        if (showStackTrace) {
            object.stackTrace = this.stack
        }

        return object;
    }
}

module.exports = HTTPError;