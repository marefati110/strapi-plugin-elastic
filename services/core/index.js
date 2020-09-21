const { createOrUpdate, findOne, destroy } = require('./functions');
const { elasticsearchManager } = require('./middleware');
const { cron, migrateModel } = require('./migration');

module.exports = {
  createOrUpdate,
  findOne,
  destroy,
  elasticsearchManager,
  cron,
  migrateModel,
};
