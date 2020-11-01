/* eslint-disable no-empty */
module.exports = {
  find: async (index, query) => {
    try {
      const elasticsearchResponse = await strapi.elastic.search({
        index,
        ...query,
      });
      return elasticsearchResponse;
    } catch (e) {}
  },
  findOne: async (index, id) => {
    try {
      const elasticsearchResponse = await strapi.elastic.get({
        index,
        id,
      });
      return elasticsearchResponse;
    } catch (e) {}
  },
  destroy: async (index, id) => {
    let elasticsearchResponse;
    try {
      elasticsearchResponse = await strapi.elastic.delete({
        id,
        index,
      });
    } catch (e) {
      console.error(e.message);
    }

    if (elasticsearchResponse) {
      return true;
    }
    return false;
  },
  createOrUpdate: async (index, id, data) => {
    let elasticsearchResponse;

    try {
      elasticsearchResponse = await strapi.elastic.update({
        id,
        index,
        body: {
          doc: data,
          doc_as_upsert: true,
        },
      });
    } catch (e) {
      strapi.log.error(e.message);
    }

    if (elasticsearchResponse) {
      return true;
    }
    return false;
  },
};
