var Datastore = require('nedb');

module.exports = new (function() {
    this.db = new Datastore({ filename: '/tmp/photo_triage', autoload: true });

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
    }
})();