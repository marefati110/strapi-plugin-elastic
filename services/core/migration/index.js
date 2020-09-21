'user strict';

const { urls, setting } = strapi.config.elasticsearch;
const { importToElasticsearch } = require('./import');

const cron = async () => {
  const urls_keys = Object.keys(urls);

  // delete indices
  if (setting.removeExistIndexForMigration) {
    for (const key of urls_keys) {
      const index = urls[key].index || key,
        service = urls[key].service;

      if (
        (setting.migration.allowEntities[0] === 'all' ||
          setting.migration.allowEntities.includes(service)) &&
        !setting.migration.disallowEntities.includes(service)
      ) {
        try {
          await strapi.elastic.indices.delete({ index: index });
          strapi.log.warn(`Index ${index} deleted.`);
        } catch (e) {
          strapi.log.error(e.meta.body.error.reason);
        }
      }
    }
  }
  // import to elasticsearch
  for (const key of urls_keys) {
    const index = urls[key].index,
      service = urls[key].service,
      withRelated = urls[key].withRelated;
    if (
      (setting.migration.allowEntities[0] === 'all' ||
        setting.migration.allowEntities.includes(service)) &&
      !setting.migration.disallowEntities.includes(service)
    ) {
      strapi.log.info('Start importing!');
      await importToElasticsearch({ index, service, withRelated });
    }
  }

  strapi.log.info('Done');
};

module.exports = { cron };
