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
    _.times(30, function (i) {
      console.log(moment([2015, 1, 1]).week(i + 21).format('DD/MM/YYYY'));
      return calendar(req.cookies.account, moment([2015, 1, 1]).week(i + 21).format('DD/MM/YYYY'));
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
  let { schoolYear, town } = req.params;

  Event
    .find({
      town,
      schoolYear,
    })
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
