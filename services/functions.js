const _ = require('lodash');
const { compareDataWithMap } = require('./core/helper');
module.exports = {
  /**
   *
   * @param {string} model
   * @param {Object} query
   */
  find: async (model, query) => {
    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    if (!targetModel) {
      strapi.log.error('model notfound');
      return;
    }

    try {
      const res = await strapi.elastic.search({
        index: targetModel.index,
        ...query,
      });
      return res;
    } catch (e) {
      strapi.log.error(e.message);
    }
  },

  /**
   *
   * @param {string} model
   * @param {Object|number|string} param1
   */
  findOne: async (model, pk) => {
    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    let id;
    if (_.isObject(pk)) {
      id = pk.id;
    } else {
      id = pk;
    }

    if (!id) {
      strapi.log.error('id parameter is not valid');
      return;
    }

    if (!targetModel) {
      strapi.log.error('model notfound');
      return;
    }

    const result = await strapi.elastic.get({
      index: targetModel.index,
      id,
    });

    return result;
  },
  /**
   *
   * @param {string} model
   * @param {Object|string|number} pk
   */
  destroy: async (model, pk) => {
    let id_in;

    if (pk.id_in && !_.isArray(pk.id_in)) {
      strapi.log.error('id_in must be array');
      return;
    }

    if (!_.isObject(pk)) {
      id_in = [pk];
    } else {
      id_in = pk.id_in || [pk.id];
    }

    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    if (!id_in) {
      strapi.log.error('pk parameter is not valid');
    }

    if (!targetModel) {
      strapi.log.error('model notfound');
      return;
    }

    const a = [];

    const body = id_in.map((id) => {
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
      strapi.log.error(e.message);
    }
  },
  /**
   *
   * @param {string} model
   * @param {Object} param1
   */
  createOrUpdate: async (model, { id, data }) => {
    const { models } = strapi.config.elasticsearch;
    const targetModel = await models.find((item) => item.model === model);

    if (!data) {
      strapi.log.error('data property is not valid');
      return;
    }

    if (!targetModel) {
      strapi.log.error('model notfound');
      return;
    }

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

    let result;
    if (!id && data) {
      result = await strapi.elastic.index({
        index: targetModel.index,
        body: data,
      });
    } else if (id && data) {
      result = await strapi.elastic.update({
        index: targetModel.index,
        id: data[targetModel.pk || 'id'],
        body: {
          doc: data,
          doc_as_upsert: true,
        },
      });

      return result;
    }
  },
  /**
   *
   * @param {string} model
   * @param {Object} param1
   */
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

    const result = await strapi.elastic.bulk({ refresh: true, body });

    return result;
  },
};
