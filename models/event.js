let mongoose = require('mongoose');

let eventSchema = mongoose.Schema({
  title: String,
  teacher: String,
  startAt: Date,
  endAt: Date,
  classroom: String,
  town: String,
  schoolYear: String,
});

eventSchema.statics.save = function (data, cb) {
  this.create(data, (err, event) => {
    if (err) {
      return cb(err);
    }

    cb(null, event);
  });
};

module.exports = mongoose.model('Event', eventSchema);
