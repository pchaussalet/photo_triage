#!/usr/bin/env node

var path = require('path'),
    Hapi = require('hapi'),
    configuration = require('./configuration'),
    handlers = require('./handlers'),
    MB = 1024 * 1024;

var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
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
            maxBytes: 500 * MB,
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
            relativeTo: configuration.WORK_DIR
        }
    }
});

server.route({
    method: 'POST',
    path: '/selection',
    handler: handlers.selection.post
});

server.route({
    method: 'GET',
    path: '/preview',
    handler: {
        file: 'preview.html'
    }
});

server.start(function() {
    console.log('Server started at:', server.info.uri);
});
