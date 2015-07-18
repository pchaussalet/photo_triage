var db = require('../lib/repository');

module.exports = function(request, reply) {
    db.list(function(err, images) {
        reply(images).type('application/json');
    });
};