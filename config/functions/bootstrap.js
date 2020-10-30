const { Client } = require('@elastic/elasticsearch');

const {
  generateConfig: { generateConfig },
  helper: { checkEnableModels, checkNewVersion },
} = require('../../services');
const {
  createOrUpdate,
  destroy,
  findOne,
  find,
  migrateModel,
  log,
} = require('../../services');

module.exports = async () => {
  await generateConfig();
  if (strapi.config.elasticsearch) {
    const { connection } = strapi.config.elasticsearch;

    // create elasticsearch instance
    const client = new Client(connection);

    // combine elasticsearch package with strapi object
    strapi.elastic = client;

    /*
     * combine custom functions with strapi ob
     */

    strapi.elastic.findOne = findOne;

    strapi.elastic.find = find;

    strapi.elastic.destroy = destroy;

    strapi.elastic.createOrUpdate = createOrUpdate;

    strapi.elastic.migrateModel = migrateModel;

    // strapi.elasticsearch logs
    strapi.elastic.log = log;

    // create  `strapi_elasticsearch` index
    createOrUpdate('strapi_elastic_config', 1, { value: 1 });

    // create index for enable models
    await checkEnableModels();

    // check new release from github
    checkNewVersion();

    // bootstrap message
    strapi.elastic.log.info('The elastic plugin is running ...', {
      setting: { saveToElastic: false },
    });
  } else {
    strapi.log.info(
      `
           ________________Well come to Elasticsearch plugin___________________
          |                                                                    |
          |      The plugin automatically generate config file in /config      |
          |______________________________Enjoy_________________________________|
      `
    );
  }
};
