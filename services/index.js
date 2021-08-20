const {
  elasticsearchManager,
  migration,
  helper,
  functions,
} = require('./core/middleware/middleware');

const {
  createOrUpdate,
  destroy,
  find,
  findOne,
  migrateById,
} = require('./functions');

const log = require('./logger');

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
