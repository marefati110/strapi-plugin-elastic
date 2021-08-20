const _ = require('lodash');
const { compareDataWithMap } = require('./helper');
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
  /**
   *
   * @param {string} model
   * @param {Object} params
   * @returns
   */
  migrateModel: async (model, params = {}) => {
    // specific condition
    params.conditions = params.conditions || {};

    const { models, setting } = strapi.config.elasticsearch;

    // set default value
    setting.importLimit = setting.importLimit || 3000;

    const targetModel = models.find((item) => item.model === model);

    let indexConfig = strapi.elastic.indicesMapping[targetModel.model];

    const { indexExist } = await strapi.elastic.indices.exists({
      index: targetModel.index,
    });

    indexConfig = indexExist ? indexConfig : null;

    if (
      !targetModel ||
      targetModel.enabled === false ||
      targetModel.migration === false
    )
      return;

    let start = 0;
    strapi.elastic.log.debug(`Importing ${targetModel.model} to elasticsearch`);

    let index_length = await strapi.query(targetModel.model).count();
    index_length = parseInt(index_length / setting.importLimit);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const start_sql = Date.now();

      strapi.log.debug(`Getting ${targetModel.model} model data from database`);
      let result = await strapi
        .query(targetModel.model, targetModel.plugin)
        .find(
          {
            _limit: setting.importLimit,
            _start: setting.importLimit * start,
            ...targetModel.conditions,
            ...params.conditions,
          },
          [...targetModel.relations]
        );
      if (result.length === 0) break;

      if (
        indexConfig &&
        indexConfig.mappings &&
        indexConfig.mappings.properties
      ) {
        const res = compareDataWithMap({
          docs: result,
          properties: indexConfig.mappings.properties,
        });

        result = res.result || result;
        //
      }

      //
      const end_sql = Date.now();
      //
      const body = await result.flatMap((doc) => [
        {
          index: {
            _index: targetModel.index,
            _id: doc[targetModel.pk || 'id'],
            _type: '_doc',
          },
        },
        doc,
      ]);
      //
      const start_elastic = Date.now();

      strapi.log.debug(
        `Sending ${targetModel.model} model to elasticsearch...`
      );
      try {
        await strapi.elastic.bulk({ refresh: true, body });
      } catch (e) {
        strapi.log.error(e);
        return;
      }

      const end_elastic = Date.now();

      start++;

      // progress bar
      strapi.log.info(
        `(${start}/${index_length + 1}) Imported to ${
          targetModel.index
        } index | sql query took ${parseInt(
          (end_sql - start_sql) / 1000
        )}s and insert to elasticsearch took ${parseInt(
          (end_elastic - start_elastic) / 1000
        )}s`
      );

      //
    }
  },
  /**
   *
   * @param {Object} params
   */
  migrateModels: async (params = {}) => {
    const { setting, models } = strapi.config.elasticsearch;

    params.models = params.models || [];
    params.conditions = params.conditions || {};

    // remove elasticsearch index before migration
    if (setting.removeExistIndexForMigration) {
      models.forEach(async (model) => {
        if (model.enabled && model.migration) {
          await strapi.elastic.indices.delete({ index: model.index });
        }
      });
    }

    if (params.models.length !== 0) {
      const targetModels = models.filter((item) =>
        params.models.includes(item.model)
      );

      // call migrateModel function for each model
      for (const item of targetModels) {
        await this.migrateModel(item.model, params);
      }
    } else {
      // call migrateModel function for each model
      for (const item of models) {
        await this.migrateModel(item.model, params);
      }
    }

    strapi.log.info('All models imported...');
  },
};
