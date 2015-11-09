let knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH
  }
});
let Bookshelf = require('bookshelf')(knex);

Bookshelf.plugin('registry');

module.exports = Bookshelf;
