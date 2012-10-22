
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , fs = require('fs')
    , path = require('path')
    , util = require('util');
var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({ uploadDir: './public/temp' }));
    app.use(express.methodOverride());

    /*session*/
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'poynt' }));

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
var io = require('socket.io').listen(server);

app.get('/', routes.index);
app.get('/index.html', require('./routes/stage').run);
app.post('/index.html', require('./routes/upload').upload);
require('./routes/quality').quality(app, server, io);