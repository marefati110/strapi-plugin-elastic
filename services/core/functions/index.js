const _ = require('lodash');
const { compareDataWithMap } = require('../helper');
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
  findOne: async (model, { id }) => {
    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    if (!targetModel || !id) return null;

    return strapi.elastic.get({
      index: targetModel.index,
      id,
    });
  },
  destroy: async (model, { id, id_in }) => {
    id_in = id_in || [id];

    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    if (!targetModel || !id_in) return null;

    const body = await id_in.map((id) => {
      return {
        delete: {
          _index: targetModel.index,
          _type: '_doc',
          _id: id,
        },
      };
    });

    try {
      return strapi.elastic.bulk({ body });
    } catch (e) {
      return null;
    }
  },
  createOrUpdate: async (model, { id, data }) => {
    const { models } = strapi.config.elasticsearch;
    const targetModel = await models.find((item) => item.model === model);

    if (!targetModel || !data) return null;

    const indexConfig = strapi.elastic.indicesMapping[targetModel.model];

    if (
      indexConfig &&
      indexConfig.mappings &&
      indexConfig.mappings.properties
    ) {
      const res = await compareDataWithMap({
        docs: data,
        properties: indexConfig.mappings.properties,
      });
      data = res.result || data;
    }

    if (!id && data) {
      //
      return strapi.elastic.index({
        index: targetModel.index,
        body: data,
      });
      //
    } else if (id && data) {
      //
      const elastic = await strapi.elastic.update({
        index: targetModel.index,
        id: data[targetModel.pk || 'id'],
        body: {
          doc: data,
          doc_as_upsert: true,
        },
      });

      return elastic;
    }
  },
  migrateById: async (model, { id, id_in, relations, conditions }) => {
    const { models } = strapi.config.elasticsearch;

    const targetModel = models.find((item) => item.model === model);

    if (!targetModel) return null;

    id_in = id_in || [id];

    relations = relations || targetModel.relations;
    conditions = conditions || targetModel.conditions;

    const data = await strapi
      .query(targetModel.model, targetModel.plugin)
      .find({ id_in: [...id_in], ...conditions }, [...relations]);

    if (!data) return null;

    const body = await data.flatMap((doc) => [
      {
        index: {
          _index: targetModel.index,
          _id: doc[targetModel.pk || 'id'],
          _type: '_doc',
        },
      },
      doc,
    ]);

    return strapi.elastic.bulk({ refresh: true, body });
  },
};
