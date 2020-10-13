const {
  createOrUpdate,
  migrateModels,
  destroy,
  elasticsearchManager,
  findOne,
  find,
  migrateModel,
} = require('./core');
const generateConfig = require('./generateConfig');
const log = require('./log');

module.exports = {
  createOrUpdate,
  migrateModels,
  find,
  destroy,
  elasticsearchManager,
  findOne,
  migrateModel,
  log,
  generateConfig,
};
