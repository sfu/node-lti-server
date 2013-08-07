/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
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

app.all('/', routes.index);
app.get('/isup', routes.isup);

app.listen(app.get('port'), function() {
    console.log('LTI server listening on port %s, PID %s', app.get('port'), process.pid);
    process.title = 'ltiserver';
});

process.title = 'ltiserver';
process.on('SIGTERM', function() {
    console.log('received SIGTERM request, stopping node-lti-server PID: %s', process.pid);
    process.exit(0);
});
