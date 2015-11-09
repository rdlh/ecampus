let express       = require('express');
let router        = express.Router();
let { calendar }  = require('../lib/ecampus');

router.get('/api/calendar/:date', (req, res, next) => {
  calendar(req.cookies.account, req.params.date.replace(/-/g, '/'))
    .then(function (response) {
      res.send(response);
    })
    .catch(function (error) {
        next(error);
    });
});

module.exports = router;
