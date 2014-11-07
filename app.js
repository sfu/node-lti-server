/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var path = require('path');
var os = require('os');
var winston = require('winston');
var session = require('express-session')
var RedisStore = require('connect-redis')(express);
var http = require('http');
var config = require('./config/appConfig.json');

// Logging
require('winston-mail').Mail;
app.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: function() { return new Date().toString(); },
            handleExceptions: true,
            colorize: true
        }),
        new (winston.transports.Mail)({
            to: 'nodejsapps-logger@sfu.ca',
            host: 'mailgate.sfu.ca',
            from: process.title + '@' + os.hostname(),
            subject: new Date().toString() + ' ' + process.title + ': {{level}}',
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
    app.enable('trust proxy');
    app.use(express.cookieParser());
    app.use(express.session({
        store: new RedisStore(config.redisSessionStore),
        secret: config.sessionSecret
    }));
    app.set('port', process.env.PORT || 3000);
    app.set('https_port', process.env.HTTPS_PORT || 3443);
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

http.createServer(app).listen(app.get('port'), function() {
    console.log('LTI server listening on port %s, PID %s', app.get('port'), process.pid);
    process.title = 'ltiserver';
});

if (process.env.HTTPS) {
    var https = require('https');
    var fs = require('fs');
    var options = {
      key: fs.readFileSync(process.env.SSL_KEYFILE),
      cert: fs.readFileSync(process.env.SSL_CERTFILE)
    };
    https.createServer(options, app).listen(app.get('https_port'), function() {
        console.log('LTI server listening on HTTPS port %s, PID %s', app.get('https_port'), process.pid);
    });
}

process.on('SIGTERM', function() {
    console.log('received SIGTERM request, stopping node-lti-server PID: %s', process.pid);
    process.exit(0);
});
