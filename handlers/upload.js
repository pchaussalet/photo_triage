var path = require('path'),
    fs = require('fs'),
    slugs = require('slugs'),
    Decompress = require('decompress'),
    sharp = require('sharp'),
    exifReader = require('exif-reader'),
    configuration = require('../configuration'),
    db = require('../lib/repository');

var ROOT_DIR = path.join(configuration.WORK_DIR, 'pictures');
if (!fs.existsSync(ROOT_DIR)) {
    fs.mkdirSync(ROOT_DIR);
}

module.exports = function(request, reply) {
    console.log('Receiving file:', request.params.filename);

    var sluggished = sluggish(request.params.author, request.params.filename);
    var filename = sluggished.filename;
    var author = sluggished.author;

    var authorDir = path.join(ROOT_DIR, author);
    if (!fs.existsSync(authorDir)) {
        fs.mkdirSync(authorDir);
    }
    var filepath = path.join(authorDir, filename);

    var writeStream = fs.createWriteStream(filepath);
    writeStream.on('finish', function() {
        if (request.headers['content-type'] === 'application/zip') {
            var tmpDir = path.join(authorDir, 'tmp');
            new Decompress()
                .src(filepath)
                .dest(tmpDir)
                .use(Decompress.zip())
                .run(function(error, files) {
                    if (error) {
                        console.log(error);
                        reply(error);
                    } else {
                        var remainingFiles = files.length;
                        var archiveFilepath = filepath;
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            sluggished = sluggish(request.params.author, path.basename(file.path));
                            filename = sluggished.filename;
                            filepath = path.join(authorDir, filename);
                            fs.linkSync(file.path, filepath);
                            fs.unlinkSync(file.path);

                            addUploadedImage(
                                filepath,
                                request.params.author,
                                path.basename(file.path),
                                sluggished,
                                function() {
                                    if (--remainingFiles == 0) {
                                        recurseRmdir(tmpDir);
                                        fs.unlinkSync(archiveFilepath);
                                        reply('success');
                                    }
                                });
                        }
                    }
                })
        } else {
            addUploadedImage(
                filepath,
                request.params.author,
                request.params.filename,
                sluggished,
                function() {
                    reply('success');
                });
        }
    });

    request.payload.pipe(writeStream);
};

function sluggish(author, filename) {
    var lastPointIndex = filename.lastIndexOf('.');
    return {
        filename: slugs(filename.substring(0, lastPointIndex)) + filename.substring(lastPointIndex),
        author: slugs(author)
    };
}

function recurseRmdir(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
        } else if(stat.isDirectory()) {
            recurseRmdir(filename);
        } else {
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
}

function extractImageTimestamp(metadata) {
    var timestamp = Date.now();
    if (metadata.exif) {
        var parsedMetadata = exifReader(metadata.exif);
        if (parsedMetadata) {
            if (parsedMetadata.exif && (parsedMetadata.exif.DateTimeOriginal || parsedMetadata.exif.DateTimeDigitized)) {
                var exif = parsedMetadata.exif;
                if (exif.DateTimeOriginal) {
                    timestamp = exif.DateTimeOriginal.getTime();
                } else {
                    timestamp = exif.DateTimeDigitized.getTime();
                }
            } else {
                if (parsedMetadata.image && parsedMetadata.image.ModifyDate) {
                    timestamp = parsedMetadata.image.ModifyDate.getTime();
                }
            }
        }
    }
    return timestamp;
}

function addUploadedImage(filepath, author, filename, sluggished, callback) {
    var image = sharp(filepath),
        doc = {
            author: author,
            filename: filename,
            fullSize: '/pictures/' + sluggished.author + '/' + sluggished.filename,
            url: '/pictures/' + sluggished.author + '/t_' + sluggished.filename,
            filepath: filepath
        };
    image
        .metadata()
        .then(function(metadata) {
            doc.timestamp = extractImageTimestamp(metadata);
            image.resize(1024, 1024)
                .max()
                .toFile(filepath.replace(sluggished.filename, 't_'+ sluggished.filename))
                .then(function() {
                    db.save(doc, callback);
                });
        });
}