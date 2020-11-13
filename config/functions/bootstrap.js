const { Client } = require('@elastic/elasticsearch');

const {
  helper: {
    checkEnableModels,
    checkNewVersion,
    generateMainConfig,
    initialStrapi,
  },
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
    const { connection } = strapi.config.elasticsearch;

    // create elasticsearch instance
    const client = new Client(connection);

    // combine elasticsearch package with strapi object
    strapi.elastic = client;

    initialStrapi();

    // combine custom functions with strapi object

    strapi.elastic.findOne = findOne;

    strapi.elastic.find = find;

    strapi.elastic.destroy = destroy;

    strapi.elastic.createOrUpdate = createOrUpdate;

    strapi.elastic.migrateModel = migrateModel;

    strapi.elastic.migrateModels = migrateModels;

    strapi.elastic.migrateById = migrateById;

    strapi.elastic.log = log;

    // create  `strapi_elasticsearch` index
    // createOrUpdate('strapi_elastic_config', { id: 1, data: { value: 1 } });

    // create index for enable models
    // await checkEnableModels();

    // check new release from github
    // checkNewVersion();

    // bootstrap message
    strapi.elastic.log.info('The elastic plugin is running ...', {
      setting: { saveToElastic: false },
    });
  }
};
