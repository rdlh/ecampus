let _             = require('lodash');
let express       = require('express');
let router        = express.Router();
let moment        = require('moment');
let { calendar }  = require('../lib/ecampus');
let Event         = require('../models/event');

router.get('/api/:town/:schoolYear/calendar/load', (req, res, next) => {
  if (req.cookies.account) {
    let { schoolYear, town } = req.params;
    schoolYear = schoolYear.toLowerCase();
    town = town.toLowerCase();

    Event
      .find({
        town,
        schoolYear,
      })
      .exec((err, events) => {
        _.each(events, (e) => e.remove());
      });

    Promise.all(
      _.times(102, function (i) {
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
  } else {
    res.redirect('/');
  }
});

router.get('/api/:town/:schoolYear/calendar', (req, res, next) => {
  let { date, schoolYear, town } = req.params;
  schoolYear = schoolYear.toLowerCase();
  town = town.toLowerCase();

  Event
    .find({
      town,
      schoolYear,
    })
    .sort({ startAt: 1 })
    .exec((err, events) => {
      if (err) {
        return next(err);
      }

      if (!events.length) {
        res.send(404);
      } else {
        res.send(_.map(events, function (e) {
          return _.pick(e, 'title', 'teacher', 'startAt', 'endAt', 'classroom', 'schoolYear', 'town');
        }));
      }
    });
});

router.get('/api/:town/:schoolYear/calendar/:date', (req, res, next) => {
  let { date, schoolYear, town } = req.params;
  schoolYear = schoolYear.toLowerCase();
  town = town.toLowerCase();

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
