'use strict';

const { Client } = require('@elastic/elasticsearch');

const {
  createOrUpdate,
  destroy,
  findOne,
  find,
  migrateModel,
  migrateModels,
  log,
  generateConfig: { generateConfig },
} = require('../../services');

// connect to server

module.exports = async () => {
  /*
   * generate default config for first time
   */
  await generateConfig();

  /*
   * execute if config file exist
   */
  if (strapi.config.elasticsearch) {
    /*
     * read elasticsearch config from config file
     */
    const { connection } = strapi.config.elasticsearch;

    /*
     * create connection to elasticsearch
     */
    const client = new Client(connection);

    /*
     * combine elasticsearch package with strapi object
     */
    strapi.elastic = client;

    /*
     * combine custom functions with strapi object
     */
    strapi.elastic.findOne = findOne;

    strapi.elastic.find = find;

    strapi.elastic.destroy = destroy;

    strapi.elastic.createOrUpdate = createOrUpdate;

    strapi.elastic.migrateModel = migrateModel;

    strapi.elastic.migrateModels = migrateModels;

    strapi.elastic.log = log;

    /*
     *  create an index to save strapi-plugin-elasticsearch configs
     */
    createOrUpdate('strapi_elasticsearch', 1, { value: 1 });

    /*
     * bootstrap message
     */
    strapi.elastic.log.info('elastic is up :D', {
      setting: { saveToElastic: false },
    });
  }
};
