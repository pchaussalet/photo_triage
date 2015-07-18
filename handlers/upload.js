var path = require('path'),
    fs = require('fs'),
    slugs = require('slugs'),
    db = require('../lib/repository');

var ROOT_DIR = '/tmp/pictures';
if (!fs.existsSync(ROOT_DIR)) {
    fs.mkdirSync(ROOT_DIR);
}

module.exports = function(request, reply) {
    console.log('Receiving file:', request.params.filename);
    var lastPointIndex = request.params.filename.lastIndexOf('.');
    var filename = slugs(request.params.filename.substring(0, lastPointIndex)) + request.params.filename.substring(lastPointIndex);
    var author = slugs(request.params.author);

    var authorDir = path.join(ROOT_DIR, author);
    if (!fs.existsSync(authorDir)) {
        fs.mkdirSync(authorDir);
    }
    var filepath = path.join(authorDir, filename);
    request.payload.pipe(fs.createWriteStream(filepath));
    db.save({
        author: request.params.author,
        filename: request.params.filename,
        url: '/pictures/' + author + '/' + filename,
        filepath: filepath
    }, function() {
        reply('success');
    });

};


