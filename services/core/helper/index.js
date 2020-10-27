module.exports = {
  checkEnableModels: async () => {
    const { models } = strapi.config.elasticsearch;

    const enableModels = models.filter((model) => model.enable === true);

    await enableModels.forEach(async (model) => {
      try {
        await strapi.elastic.indices.create({ index: model.index });
        strapi.elastic.log.debug(`${model.index} index created.`);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
  },
};
