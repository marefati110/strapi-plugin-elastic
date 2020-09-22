'use strict';

const os = require('os-utils');
const moment = require('moment');

async function sendToElasticsearch({ data, metaData, msg, level }) {
  const body = { data };
  body.msg = msg;

  if (metaData) {
    body.time = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    body.metaData = {
      pid: process.pid,
      cpu_usage: os.cpuUsage(),
      free_mem: os.freemem(),
      level,
    };
  }
  if (data) {
    strapi.elastic.index({
      index: 'strapi_elasticsearch_log',
      body: data,
    });
  }
}

module.exports = {
  custom: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'custom' });
    return await strapi.log.error(msg);
  },
  warn: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'warn' });
    return await strapi.log.warn(msg);
  },
  fatal: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'fatal' });
    return await strapi.log.fatal(msg);
  },
  trace: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'trace' });
    return await strapi.log.trace(msg);
  },
  info: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'info' });
    return await strapi.log.info(msg);
  },
  debug: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'debug' });
    return await strapi.log.debug(msg);
  },
  error: async (msg, data = false, metaData = false) => {
    sendToElasticsearch({ msg, data, metaData, level: 'error' });
    return await strapi.log.error(msg);
  },
};
