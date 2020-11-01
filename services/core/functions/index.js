/* eslint-disable no-empty */
module.exports = {
  // need refactor
  find: async (index, query) => {
    try {
      const res = await strapi.elastic.search({
        index,
        ...query,
      });
      return res;
    } catch (e) {
      return null;
    }
  },
  findOne: async (index, id) => {
    try {
      const res = await strapi.elastic.get({
        index,
        id,
      });
      return res;
    } catch (e) {
      return null;
    }
  },
  destroy: async (index, id) => {
    try {
      const res = await strapi.elastic.delete({
        id,
        index,
      });
      return res;
    } catch (e) {
      return null;
    }
  },
  createOrUpdate: async (index, id, data) => {
    try {
      const res = await strapi.elastic.update({
        id,
        index,
        body: {
          doc: data,
          doc_as_upsert: true,
        },
      });
      return res;
    } catch (e) {
      return null;
    }
  },
};
