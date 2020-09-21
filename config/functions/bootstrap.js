'use strict';

const { Client } = require('@elastic/elasticsearch');
const { connection } = strapi.config.elasticsearch;
const {
  createOrUpdate,
  destroy,
  findOne,
  migrateModel,
} = require('../../services');

// connect to server
const client = new Client(connection);

module.exports = async () => {
  // combine elasticsearch package with strapi object
  strapi.elastic = client;
  // combine custom functions with strapi object
  strapi.elastic.findOne = findOne;
  strapi.elastic.destroy = destroy;
  strapi.elastic.createOrUpdate = createOrUpdate;
  strapi.elastic.migrateModel = migrateModel;
  // create  `strapi_elasticsearch` index
  createOrUpdate('strapi_elasticsearch', 1, { value: 1 });
};
