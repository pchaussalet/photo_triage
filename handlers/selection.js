var db = require('../lib/repository');

exports.post = function(request, reply) {
    db.update(request.params.pictureId, { $inc: { likes: 1 }}, function() {
        reply('success');
    });
};