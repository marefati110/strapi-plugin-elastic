const { Client } = require('@elastic/elasticsearch');

const {
  helper: { generateMainConfig, initialStrapi },
} = require('../../services');
const {
  log,
  migration: { migrateModel, migrateModels },
  functions: { find, findOne, createOrUpdate, destroy, migrateById },
} = require('../../services');

module.exports = async () => {
  //
  generateMainConfig();

  //
  if (strapi.config.elasticsearch) {
    //

    const { connection } = strapi.config.elasticsearch;

    const client = new Client(connection);

    strapi.elastic = client;

    initialStrapi();

    strapi.elastic.findOne = findOne;

    strapi.elastic.find = find;

    strapi.elastic.destroy = destroy;

    strapi.elastic.createOrUpdate = createOrUpdate;

    strapi.elastic.migrateModel = migrateModel;

    strapi.elastic.migrateModels = migrateModels;

    strapi.elastic.migrateById = migrateById;

    strapi.elastic.log = log;

    strapi.elastic.log.info('The elastic plugin is running ...', {
      setting: { saveToElastic: false },
    });
  }
};
