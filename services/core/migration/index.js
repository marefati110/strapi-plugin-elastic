'user strict';

const { urls, setting } = strapi.config.elasticsearch;
const { importToElasticsearch } = require('./import');

module.exports = {
  migrateModel: importToElasticsearch,
  cron: async () => {
    const urls_keys = Object.keys(urls);

    // delete indices
    if (setting.removeExistIndexForMigration) {
      for (const key of urls_keys) {
        const index = urls[key].index || key;
        const { service } = urls[key];

        if (
          (setting.migration.allowEntities[0] === 'all'
            || setting.migration.allowEntities.includes(service))
          && !setting.migration.disallowEntities.includes(service)
        ) {
          try {
            await strapi.elastic.indices.delete({ index });
            strapi.log.warn(`Index ${index} deleted.`);
          } catch (e) {
            strapi.log.error(e.meta.body.error.reason);
          }
        }
      }
    }
    // import to elasticsearch
    strapi.log.info('Start importing!');
    for (const key of urls_keys) {
      const { index } = urls[key];
      const { service } = urls[key];
      const { withRelated } = urls[key];
      if (
        (setting.migration.allowEntities[0] === 'all'
          || setting.migration.allowEntities.includes(service))
        && !setting.migration.disallowEntities.includes(service)
      ) {
        await importToElasticsearch({ index, service, withRelated });
      }
    }

    strapi.log.info('Done');
  },
};
