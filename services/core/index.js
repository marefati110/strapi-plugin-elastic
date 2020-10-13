const { createOrUpdate, findOne, destroy, find } = require('./functions');
const { elasticsearchManager } = require('./middleware');
const { migrateModel, migrateModels } = require('./migration');

module.exports = {
  createOrUpdate,
  findOne,
  find,
  destroy,
  elasticsearchManager,
  migrateModel,
  migrateModels,
};
