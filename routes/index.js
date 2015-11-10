let express   = require('express');
let router    = express.Router();
let { login } = require('../lib/ecampus');

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/', (req, res, next) => {
  let { email, password } = req.body;

  let data = {
    'form.submitted': 1,
    came_from: 'http://ecampusnord.epsi.fr/',
    __ac_name: email,
    __ac_password: password,
  };

  login(data)
    .then(function (account) {
      res
        .cookie('account', eval(account.value), { httpOnly: true })
        .redirect('/api/lille/i5/calendar/09-11-2015');
    })
    .catch(function (error) {
        next(error);
    });
});

module.exports = router;
