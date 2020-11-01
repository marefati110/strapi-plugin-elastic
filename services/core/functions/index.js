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
  migrateById: async (model, { id, id_in }) => {
    const { models } = strapi.config.elasticsearch;

    const targetModel = models.find((item) => item.model === model);

    if (!targetModel) return null;

    id_in = id_in || [id];

    const data = await strapi
      .query(targetModel.model, targetModel.plugin)
      .find({ id_in: [...id_in], ...targetModel.conditions }, [
        ...targetModel.relations,
      ]);

    if (!data) return null;

    const body = await data.flatMap((doc) => [
      {
        index: { _index: targetModel.index, _id: doc[targetModel.pk || 'id'] },
      },
      doc,
    ]);

    await strapi.elastic.bulk({ refresh: true, body });
  },
};
