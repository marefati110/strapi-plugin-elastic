'user strict';

const { migrateModel } = require('./migrate');

module.exports = {
  migrateModel,
  migrateAllModels: async () => {
    const { setting, models } = strapi.config.elasticsearch;

    /*
     * remove elasticsearch index before migration
     * function will execute for all models
     */
    if (setting.removeExistIndexForMigration) {
      await models.map(async (model) => {
        await strapi.elastic.indices.delete({ index: model.index });
      });
    }

    strapi.elastic.log.info('Import all model to elasticsearch.');

    /*
     * call migrateModel function for each model
     */
    await models.map(async (model) => {
      await migrateModel(model);
    });

    strapi.elastic.log.info('All models imported to elasticsearch.');
  },
};
