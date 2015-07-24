var sharp = require('sharp'),
    exifReader = require('exif-reader'),
    Promise = require('bluebird');

exports.run = function(db) {
    console.log('Running maintenance tasks on DB');
    var stats = {
        changed: 0,
        docs: 0
    };
    db.list(function(error, docs) {
        var remainingDocs = docs.length;
        stats.docs = remainingDocs;
        for (var i = 0; i < stats.docs; i++) {
            normalize(docs[i], function(doc, hasChanged) {
                if (hasChanged) {
                    stats.changed++;
                    db.update(doc._id, doc, function(error) {
                        if (error) {
                            console.log(error);
                        } else {
                            if (--remainingDocs == 0) {
                                finalize(stats);
                            }
                        }
                    });
                } else {
                    if (--remainingDocs == 0) {
                        finalize(stats);
                    }
                }
            });
        }
    });

    function finalize(stats) {
        db.compact();
        console.log(stats.docs + ' document(s) in database');
        console.log(stats.changed + ' documet(s) normalized');
    }
};

function normalize(doc, callback) {
    var hasChanged = false;
    var timestampPromise;
    if (typeof doc.timestamp == "undefined") {
        var image = sharp(doc.filepath);
        timestampPromise = image
            .metadata()
            .then(function(metadata) {
                doc.timestamp = extractImageTimestamp(metadata);
            });
        hasChanged = true;
    } else {
        timestampPromise = Promise.resolve();
    }

    timestampPromise.then(function() {
        if (typeof doc.fullSize == "undefined") {
            doc.fullSize = doc.url.replace('/t_', '/');
            hasChanged = true;
        }
        callback.call(this, doc, hasChanged);
    });
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


