'user strict';

const { urls, setting } = strapi.config.elasticsearch;
const { importToElasticsearch } = require('./import');

const cron = async () => {
  const urls_keys = Object.keys(urls);

  // delete indices
  if (setting.removeExistIndexForMigration) {
    for (const key of urls_keys) {
      const index = urls[key].index || key,
        serviceName = urls[key].serviceName;

      if (
        (setting.migration.allowEntities[0] === 'all' ||
          setting.migration.allowEntities.includes(serviceName)) &&
        !setting.migration.disallowEntities.includes(serviceName)
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
      serviceName = urls[key].serviceName,
      withRelated = urls[key].withRelated;
    if (
      (setting.migration.allowEntities[0] === 'all' ||
        setting.migration.allowEntities.includes(serviceName)) &&
      !setting.migration.disallowEntities.includes(serviceName)
    ) {
      strapi.log.info('Start importing!');
      await importToElasticsearch({ index, serviceName, withRelated });
    }
  }

  strapi.log.info('Done');
};

module.exports = { cron };
