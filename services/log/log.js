'use strict';

module.exports = {
  warn: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.warn(msg);
  },
  fatal: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.fatal(msg);
  },
  trace: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.trace(msg);
  },
  info: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.info(msg);
  },
  debug: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.debug(msg);
  },
  error: async (msg, data = false) => {
    if (data) {
      strapi.elastic.index({
        index: 'strapi_elasticsearch_log',
        body: data,
      });
    }
    return await strapi.log.error(msg);
  },
};
