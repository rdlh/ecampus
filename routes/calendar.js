let _             = require('lodash');
let express       = require('express');
let router        = express.Router();
let moment        = require('moment');
let { calendar }  = require('../lib/ecampus');
let Event         = require('../models/event');

router.get('/api/:town/:schoolYear/calendar/load', (req, res, next) => {
  let { schoolYear, town } = req.params;

  Event
    .find({
      town,
      schoolYear,
    })
    .exec((err, events) => {
      _.each(events, (e) => e.remove());
    });

  Promise.all(
    _.times(51, function (i) {
      return calendar(req.cookies.account, moment([2015, 1, 1]).week(i).format('MM/DD/YYYY'));
    })
  )
    .then(function (items) {
      _.each(_.flatten(items), (e) => {
        e.schoolYear = schoolYear;
        e.town = town;

        Event.save(e, (err, event) => {});
      });

      res.redirect(`/api/${town}/${schoolYear}/calendar/${moment().format('DD-MM-YYYY')}`);
    })
    .catch(function (error) {
      next(error);
    });
});

router.get('/api/:town/:schoolYear/calendar/:date', (req, res, next) => {
  let { date, schoolYear, town } = req.params;

  Event
    .find({
      town,
      schoolYear,
      startAt: {
        '$gte': moment(date, 'DD-MM-YYYY').startOf('week'),
        '$lt': moment(date, 'DD-MM-YYYY').endOf('week'),
      },
    })
    .sort({ startAt: 1 })
    .exec((err, events) => {
      if (err) {
        return next(err);
      }

      res.send(_.map(events, function (e) {
        return _.pick(e, 'title', 'teacher', 'startAt', 'endAt', 'classroom', 'schoolYear', 'town');
      }));
    });
});

module.exports = router;
