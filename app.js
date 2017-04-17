const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const storageClient = require('./lib/storage-client');

const api = require('./routes/api');

let app = express();

var env = process.env.ENVIRONMENT || app.get('env');

storageClient.connectEnvironment(env);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'front-end', 'dist')));

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, true);
    },
    maxAge: 86400
}));

app = api(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    const onDevelopment = req.app.get('env') === 'development';

    res.locals.message = err.message;
    res.locals.error = onDevelopment ? err : {};

    // render the error page
    res.status(err.status || 500);

    let errorObject;
    if (err && typeof err.toJSON == 'function') {
        errorObject = err.toJSON(onDevelopment);
    } else {
        errorObject = err;
    }

    res.json({error: errorObject});
});

module.exports = app;
