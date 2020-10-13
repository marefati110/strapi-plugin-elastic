'user strict';

const { migrateModel } = require('./migrate');

module.exports = {
  migrateModel,
  migrateModels: async () => {
    const { setting, models } = strapi.config.elasticsearch;

    /*
     * remove elasticsearch index before migration
     */
    if (setting.removeExistIndexForMigration) {
      /*
       * function will execute for all models
       */
      await models.map(async (model) => {
        /*
         * check model are enable
         */
        if (model.enable === true) {
          //
          await strapi.elastic.indices.delete({ index: model.index });
        }
      });
    }

    strapi.elastic.log.info('Import all model to elasticsearch.');

    /*
     * call migrateModel function for each model
     */
    await models.map(async (model) => {
      /*
       * check model are enable
       */
      if (model.enable === true) {
        //
        await migrateModel(model);
      }
    });

    strapi.elastic.log.info('All models imported to elasticsearch.');
  },
};
