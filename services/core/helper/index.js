const axios = require('axios');

module.exports = {
  checkEnableModels: async () => {
    const { models } = strapi.config.elasticsearch;

    const enableModels = models.filter((model) => model.enable === true);

    await enableModels.forEach(async (model) => {
      const indexName = model.index_postfix + model.index + model.index_postfix;
      try {
        await strapi.elastic.indices.create({ index: indexName });
        strapi.elastic.log.debug(`${model.index} index created.`);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
  },
  checkNewVersion: async () => {
    const { setting } = strapi.config.elasticsearch;

    const currentVersion = setting.version;

    const releases = await axios.default.get(
      'https://api.github.com/repos/marefati110/strapi-plugin-elastic/releases'
    );

    const lastVersion = releases.data[0];

    if (
      currentVersion !== lastVersion.tag_name &&
      lastVersion.prerelease === false
    ) {
      strapi.log.warn(
        'There is new version for strapi-plugin-elastic. please update plugin.'
      );
    }
  },
};
