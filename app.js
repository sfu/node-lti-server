/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    path = require('path'),
    os = require('os'),
    winston = require('winston');


// Logging
require('winston-mail').Mail;
app.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function() { return new Date().toString(); },
            handleExceptions: true
        }),
        new (winston.transports.Mail)({
            to: 'nodejsapps-logger@sfu.ca',
            host: 'mailgate.sfu.ca',
            from: process.title + '@' + os.hostname(),
            subject: new Date().toString() + ' ' + process.title + ': {{level}} {{msg}}',
            tls: true,
            level: 'error',
            timestamp: function() { return new Date().toString(); },
            handleExceptions: true
        })
    ]
});

var winstonStream = {
    write: function(str) {
        str = str.replace(/(\n|\r)+$/, '');
        app.logger.info(str);
    }
};

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    express.logger.token('localtime', function(req, res) {
        return new Date().toString();
    });
    express.logger.token('remote-ip', function(req, res) {
        return req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : (req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)));

    });
    app.use(express.logger({
        stream: winstonStream,
        format: ':remote-ip - - [:localtime] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time'
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.configure('production', function() {
    app.use(function(error, req, res, next) {
        res.status(500);
        res.render('500', {title: 'LTI Server'});
        console.log(error.stack);
    });
});

// Require components
require('./components')(app, express);

app.listen(app.get('port'), function() {
    console.log('LTI server listening on port %s, PID %s', app.get('port'), process.pid);
    process.title = 'ltiserver';
});

process.on('SIGTERM', function() {
    console.log('received SIGTERM request, stopping node-lti-server PID: %s', process.pid);
    process.exit(0);
});
