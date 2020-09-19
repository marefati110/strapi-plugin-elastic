'use strict';

const { Client } = require('@elastic/elasticsearch');
const { connection } = strapi.config.elasticsearch;
const {
  createOrUpdate,
} = require('../../services/core/functions/CreateOrUpdate');
const { findOne } = require('../../services/core/functions/findOne');
const { destroy } = require('../../services/core/functions/Delete');

// connect to server
const client = new Client(connection);

module.exports = async () => {
  strapi.elastic = client;
  strapi.elastic.findOne = findOne;
  strapi.elastic.destroy = destroy;
  strapi.elastic.createOrUpdate = createOrUpdate;
  
  const result = await findOne('strapi_elasticsearch', 1);
  if (!result)
    await createOrUpdate('strapi_elasticsearch', 1, { sql_lat_value: 0 });
};
