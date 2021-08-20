const os = require('os');
const moment = require('moment');

const sendToElasticsearch = (data) => {
  if (data && data.setting && data.setting.saveToElastic === false) return;

  const index =
    (data.setting && data.setting.index) || 'strapi_elasticsearch_log';

  data.metaData = {
    pid: process.pid,
    free_mem: os.freemem(),
    total_mem: os.totalmem(),
    hostname: os.hostname(),
    loadavg: os.loadavg(),
    time: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
  };

  delete data.setting;

  return strapi.elastic.index({
    index,
    body: data,
  });
};

const displayLog = (data) => {
  // deprecated property
  let show = data && data.setting && data.setting.show;
  show = typeof show === 'boolean' ? show : true;

  let display = data && data.setting && data.setting.display;
  show = typeof display === 'boolean' ? display : true;

  return show && display;
};

const log = ({ level, msg, data }) => {
  if (displayLog(data)) {
    strapi.log[level](msg);
  }
};

module.exports = {
  custom: (msg, data) => {
    log({ msg, data, level: false });
    sendToElasticsearch({ msg, ...data, level: 'custom' });
  },
  warn: (msg, data) => {
    log({ msg, level: 'warn', data });
    sendToElasticsearch({ msg, ...data, level: 'warn' });
  },
  fatal: (msg, data) => {
    log({ msg, level: 'fatal', data });
    sendToElasticsearch({ msg, ...data, level: 'fatal' });
  },
  info: (msg, data) => {
    log({ msg, level: 'info', data });
    sendToElasticsearch({ msg, ...data, level: 'info' });
  },
  debug: (msg, data) => {
    log({ msg, level: 'debug', data });
    sendToElasticsearch({ msg, ...data, level: 'debug' });
  },
  error: (msg, data) => {
    log({ msg, level: 'error', data });
    sendToElasticsearch({ msg, ...data, level: 'error' });
  },
};
