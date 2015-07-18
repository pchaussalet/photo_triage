var path = require('path'),
    Hapi = require('hapi'),
    handlers = require('./handlers');

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 9000,
    routes: {
        files: {
            relativeTo: path.join(__dirname, 'public')
        }
    }
});

server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
        directory: {
            path: 'assets'
        }
    }
});

server.route({
    method: 'GET',
    path:'/',
    handler: {
        file: 'index.html'
    }
});

server.route({
    method: 'POST',
    path: '/upload/{author}/{filename}',
    handler: handlers.upload,
    config: {
        payload: {
            maxBytes: 30 * 1024 * 1024,
            parse: false,
            output: 'stream'
        }
    }
});

server.route({
    method: 'GET',
    path: '/triage',
    handler: {
        file: 'triage.html'
    }
});

server.route({
    method: 'GET',
    path: '/images',
    handler: handlers.images
});

server.route({
    method: 'GET',
    path: '/pictures/{param*}',
    handler: {
        directory: {
            path: 'pictures'
        }
    },
    config: {
        files: {
            relativeTo: '/tmp'
        }
    }
});

server.route({
    method: 'POST',
    path: '/selection',
    handler: handlers.selection.post
});

server.start(function() {
    console.log('Server started at:', server.info.uri);
});