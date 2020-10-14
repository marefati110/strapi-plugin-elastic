const os = require('os');
const moment = require('moment');

const sendToElasticsearch = (data) => {
  if (data && data.setting && data.setting.saveToElastic === false) return;

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

const log = ({ show, level, msg }) => {
  show = show !== false;

  if (show && level) {
    strapi.log[level](msg);
  } else if (show && !level) {
    console.log(msg);
  }
};

module.exports = {
  custom: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: false, show });
    sendToElasticsearch({ msg, ...data, level: 'custom' });
  },
  warn: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: 'warn', show });
    sendToElasticsearch({ msg, ...data, level: 'warn' });
  },
  fatal: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: 'fatal', show });
    sendToElasticsearch({ msg, ...data, level: 'fatal' });
  },
  info: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: 'info', show });
    sendToElasticsearch({ msg, ...data, level: 'info' });
  },
  debug: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: 'debug', show });
    sendToElasticsearch({ msg, ...data, level: 'debug' });
  },
  error: (msg, data) => {
    const show = data && data.setting && data.setting.show;
    log({ msg, level: 'error', show });
    sendToElasticsearch({ msg, ...data, level: 'error' });
  },
};
