var path = require('path'),
    fs = require('fs'),
    slugs = require('slugs'),
    configuration = require('../configuration'),
    db = require('../lib/repository');

var ROOT_DIR = path.join(configuration.WORK_DIR, 'selection');
if (!fs.existsSync(ROOT_DIR)) {
    fs.mkdirSync(ROOT_DIR);
}

exports.post = function(request, reply) {
    var ids = request.payload;
    var remainingFiles = length = ids.length;
    db.updateAll({ $unset: { selected: true }}, function() {
        for (var i = 0; i < length; i++) {
            db.update(ids[i], { $set: { selected: true }}, function() {
                if (--remainingFiles == 0) {
                    reply('success');
                }
            });
        }
    });

/*
        db.get(ids[i], function(error, doc) {
            var lastPointIndex = doc.filename.lastIndexOf('.');
            var filename = slugs(doc.filename.substring(0, lastPointIndex)) + doc.filename.substring(lastPointIndex);
            var author = slugs(doc.author);
            fs.link(doc.filepath, path.join(ROOT_DIR, author+'_'+filename), function() {
                if (--remainingFiles == 0) {
                    reply('success');
                }
            });
        });
*/
};