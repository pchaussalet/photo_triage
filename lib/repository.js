var path = require('path'),
    Datastore = require('nedb'),
    configuration = require('../configuration'),
    maintenance = require('./maintenance');

module.exports = new (function() {
    this.db = new Datastore({ filename: path.join(configuration.WORK_DIR, 'photo_triage'), autoload: true });
    this.db.persistence.setAutocompactionInterval(15);

    this.compact = function() {
        this.db.persistence.compactDatafile();
    };

    this.save = function(image, callback) {
        this.db.insert(image, callback);
    };

    this.list = function(callback) {
        this.db.find({}, callback);
    };

    this.get = function(id, callback) {
        this.db.find({ _id: id }, function(error, docs) {
            var doc = docs ? docs[0] : null;
            callback(error, doc);
        });
    };

    this.update = function(id, update, callback) {
        this.db.update({ _id: id }, update, { multi: false }, callback);
    };

    this.updateAll = function(update, callback) {
        var self = this;
        this.list(function(error, docs) {
            var remainingDocs = docs.length,
                updated = 0;
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                self.update(doc._id, update, function(error, numUpdated) {
                    updated += numUpdated;
                    if (--remainingDocs == 0) {
                        if (typeof callback === 'function') {
                            callback(null, updated);
                        }
                    }
                })
            }
        });
    };
    maintenance.run(this);
})();