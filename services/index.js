const {
  elasticsearchManager,
  migration,
  helper,
  functions,
} = require('./core');

const {
  createOrUpdate,
  destroy,
  find,
  findOne,
  migrateById,
} = require('./functions');

const log = require('./log');

module.exports = {
  createOrUpdate,
  find,
  destroy,
  elasticsearchManager,
  findOne,
  migrateById,
  migration,
  log,
  helper,
  functions,
};
