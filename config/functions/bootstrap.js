const { Client } = require('@elastic/elasticsearch');
const {
  generateConfig: { generateConfig },
  helper: { checkEnableModels },
} = require('../../services');
const {
  createOrUpdate,
  destroy,
  findOne,
  find,
  migrateModel,
  log,
} = require('../../services');

// connect to server

module.exports = async () => {
  await generateConfig();
  if (strapi.config.elasticsearch) {
    const { connection } = strapi.config.elasticsearch;
    const client = new Client(connection);
    // combine elasticsearch package with strapi object
    strapi.elastic = client;

    // combine custom functions with strapi object
    strapi.elastic.findOne = findOne;
    strapi.elastic.find = find;
    strapi.elastic.destroy = destroy;
    strapi.elastic.createOrUpdate = createOrUpdate;
    strapi.elastic.migrateModel = migrateModel;
    // strapi.elasticsearch logs
    strapi.elastic.log = log;
    // create  `strapi_elasticsearch` index
    createOrUpdate('strapi_elasticsearch', 1, { value: 1 });

    // create index for enable models
    await checkEnableModels();

    // bootstrap message
    strapi.elastic.log.info('The elastic plugin is running ...', {
      setting: { saveToElastic: false },
    });
  }
};
