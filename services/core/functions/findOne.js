module.exports = {
  findOne: async (index, id) => {
    try {
      const elasticsearchResponse = await strapi.elastic.get({
        index,
        id,
      });
      return elasticsearchResponse;
    } catch (e) {

    }
  },
};
