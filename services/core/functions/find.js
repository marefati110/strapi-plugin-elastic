module.exports = {
  find: async (index, query) => {
    try {
      const elasticsearchResponse = await strapi.elastic.search({
        index,
        ...query,
      });
      return elasticsearchResponse;
    } catch (e) {

    }
  },
};
