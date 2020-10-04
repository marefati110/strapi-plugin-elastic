'use strict';

const os = require('os');
const moment = require('moment');

const sendToElasticsearch = (data) => {
  data.time = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  data.metaData = {
    pid: process.pid,
    free_mem: os.freemem(),
    total_mem: os.totalmem(),
    hostname: os.hostname(),
    loadavg: os.loadavg(),
  };

  return strapi.elastic.index({
    index: 'strapi_elasticsearch_log',
    body: data,
  });
};

module.exports = {
  custom: (msg, data) => {
    sendToElasticsearch({ msg, ...data, level: 'custom' });
    return console.log(msg);
  },
  warn: (msg, data) => {
    sendToElasticsearch({ msg, ...data, level: 'warn' });
    return strapi.log.warn(msg);
  },
  fatal: (msg, data) => {
    sendToElasticsearch({ msg, ...data, level: 'fatal' });
    return strapi.log.fatal(msg);
  },
  info: (msg, data) => {
    sendToElasticsearch({ msg, ...data, level: 'info' });
    return strapi.log.info(msg);
  },
  debug: (msg, data) => {
    sendToElasticsearch({ msg, ...data, level: 'debug' });
    return strapi.log.debug(msg);
  },
  error: (msg, data) => {
    sendToElasticsearch({ msg, data, level: 'error' });
    return strapi.log.error(msg);
  },
};
