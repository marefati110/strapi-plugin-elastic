const {
  createOrUpdate,
  destroy,
  elasticsearchManager,
  findOne,
  find,
  migrateModel,
  helper,
  functions,
} = require('./core');

const generateConfig = require('./generateConfig');
const log = require('./log');

module.exports = {
  createOrUpdate,
  find,
  destroy,
  elasticsearchManager,
  findOne,
  migrateModel,
  log,
  helper,
  functions,
  generateConfig,
};
