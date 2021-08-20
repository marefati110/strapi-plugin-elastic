const { Client } = require('@elastic/elasticsearch');

const {
  helper: { generateMainConfig, initialStrapi },
} = require('../../services');
const {
  log,
  migration: { migrateModel, migrateModels },
  find,
  findOne,
  createOrUpdate,
  destroy,
  migrateById,
} = require('../../services');

module.exports = async () => {
  /**
   * generate elasticsearch config file
   */
  generateMainConfig();

  /**
   * initialize strapi.elastic object
   */
  if (strapi.config.elasticsearch) {
    const { connection } = strapi.config.elasticsearch;

    const client = new Client(connection);

    strapi.elastic = client;

    initialStrapi();

    const functions = {
      findOne,
      find,
      destroy,
      createOrUpdate,
      migrateModel,
      transferModelData: migrateModel,
      migrateModels,
      transferModelsData: migrateModels,
      migrateById,
      transferModelDataById: migrateById,
      log,
    };

    Object.assign(strapi.elastic, functions);

    strapi.log.info('The elastic plugin is running');
  }
};
