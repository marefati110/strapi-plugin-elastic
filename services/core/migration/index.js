'user strict';

const { urls, setting } = strapi.config.elasticsearch;
const { importToElasticsearch } = require('./import');

const cron = async () => {
  const urls_keys = Object.keys(urls);

  // delete indices
  if (setting.removeExistIndexForMigration) {
    for (const key of urls_keys) {
      const index = urls[key].index || key,
        infoName = urls[key].infoName;

      if (
        (setting.migration.allowEntities[0] === 'all' ||
          setting.migration.allowEntities.includes(infoName)) &&
        !setting.migration.disallowEntities.includes(infoName)
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
      infoName = urls[key].infoName,
      withRelated = urls[key].withRelated;
    if (
      (setting.migration.allowEntities[0] === 'all' ||
        setting.migration.allowEntities.includes(infoName)) &&
      !setting.migration.disallowEntities.includes(infoName)
    ) {
      strapi.log.info('Start importing!');
      await importToElasticsearch({ index, infoName, withRelated });
    }
  }

  strapi.log.info('Done');
};

module.exports = { cron };
