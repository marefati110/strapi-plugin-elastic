const { createOrUpdate, findOne, destroy, find } = require('./functions');
const functions = require('./functions');
const { elasticsearchManager } = require('./middleware');
const { migrateModel } = require('./migration');
const helper = require('./helper');

module.exports = {
  createOrUpdate,
  findOne,
  find,
  destroy,
  helper,
  functions,
  elasticsearchManager,
  migrateModel,
};
