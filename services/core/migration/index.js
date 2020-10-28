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
      await models.forEach(async (model) => {
        if (model.enable) {
          await strapi.elastic.indices.delete({ index: model.index });
        }
      });
    }

    /*
     * call migrateModel function for each model
     */
    await models.forEach(async (model) => {
      if (model.enable) {
        await migrateModel(model);
      }
    });

  },
};
