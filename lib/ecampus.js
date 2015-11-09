let _           = require('lodash');
let request     = require('request');
let cheerio     = require('cheerio');
let moment      = require('moment');
let ECAMPUS_URL = 'http://ecampusnord.epsi.fr';

const calendar = (cookie, date) => {
  return new Promise(function (resolve, reject) {
    let j = request.jar();
    j.setCookie(request.cookie(`__ac=${cookie}`), ECAMPUS_URL);

    request.get({ url: `${ECAMPUS_URL}/emploi_du_temps?date=${date}`, jar: j }, function (err, httpResponse, body) {
      if (err) {
        return reject(err);
      }

      let $ = cheerio.load(body);
      let items = [];

      $('table.TCase').each(function () {
        if ($(this).find('.TCase').text()) {
          let hours = $(this).find('.TChdeb').text().split(' - ');
          let start = hours[0].split(':');
          let end = hours[1].split(':');

          items.push({
            title: $(this).find('.TCase').text(),
            teacher: $('<div>' + $(this).find('.TCProf').html().split('<br>')[0] + '</div>').text(),
            startAt: moment().hour(start[0]).minute(start[1]),
            endAt: moment().hour(end[0]).minute(end[1]),
            classroom: $(this).find('.TCSalle').text(),
          });
        }
      });

      resolve(items);
    });
  });
};

const login = (data) => {
  return new Promise(function (resolve, reject) {
    let j = request.jar();

    request.post({ url: `${ECAMPUS_URL}/login_form`, form: data, jar: j }, function (err, httpResponse, body) {
      if (err) {
        return reject(err);
      }

      let cookies = j.getCookies(ECAMPUS_URL);

      resolve(_.findWhere(cookies, (c) => c.key == '__ac'));
    });
  });
};

module.exports = {
  calendar,
  login,
};
