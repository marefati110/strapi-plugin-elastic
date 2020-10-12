'use strict';

const { Client } = require('@elastic/elasticsearch');
const {
  generateConfig: { generateConfig },
} = require('../../services');
const { connection } = strapi.config.elasticsearch;
const {
  createOrUpdate,
  destroy,
  findOne,
  find,
  migrateModel,
  log,
} = require('../../services');

// connect to server
const client = new Client(connection);

module.exports = async () => {
  // combine elasticsearch package with strapi object
  strapi.elastic = client;
  await generateConfig();
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
};
