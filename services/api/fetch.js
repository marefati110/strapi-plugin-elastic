module.exports = {
  fetchModels: (params) => {
    /*
     * get models obj from config file
     */
    const { models } = strapi.config.elasticsearch;
    /*
     * filter model by enable status
     */
    return models.filter((model) => model.enable === params.enable);
  },
  fetchModel: async (params) => {
    const result = await strapi.elastic.search({
      index: params.index,
      body: {
        from: (params.limit || 10) * (params.page || 0),
        size: params.limit || 10,
        query: {
          match_all: {},
        },
      },
    });

    if (result && result['_shards'] && result['_shards'].successful === 1) {
      return result.hits.hits;
    }
  },
};
