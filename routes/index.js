let path      = require('path');
let express   = require('express');
let router    = express.Router();
let { login } = require('../lib/ecampus');
let whitelist = require(path.join(__dirname, '..', 'config', 'whitelist.json'));

router.get('/', (req, res) => {
  res.render('index', { whitelist });
});

router.post('/', (req, res, next) => {
  let { email, password, promo } = req.body;
  let [town, schoolYear] = promo.split(' ');

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
        .redirect(`/api/${town}/${schoolYear}/calendar/load`);
    })
    .catch(function (error) {
        next(error);
    });
});

module.exports = router;
