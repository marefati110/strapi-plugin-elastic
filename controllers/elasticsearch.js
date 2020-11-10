const _ = require('lodash');
const flatten = require('flat');
const {
  migration: { migrateModel, migrateModels },
} = require('../services');

module.exports = {
  migrateModels: async (ctx) => {
    await ctx.send({
      message: 'on progress it can take a few minuets',
    });

    migrateModels();
  },
  migrateModel: async (ctx) => {
    const { model } = ctx.request.body;
    try {
      await strapi.elastic.migrateModel(model);
      return ctx.send({ success: true });
    } catch (e) {
      return ctx.throw(500);
    }
  },
  fetchModels: (ctx) => {
    const { models } = strapi.config.elasticsearch;

    const enabledModels = models.filter((model) => model.enable);
    const sortedEnabledModels = _.sortBy(enabledModels, (item) => {
      item.model;
    });

    const disabledModels = models.filter((model) => !model.enable);
    const sortedDisabledModels = _.sortBy(disabledModels, (item) => item.model);

    // there is a bug here
    // models are not sorted
    const allModels = [...sortedEnabledModels, ...sortedDisabledModels];

    const response = _.map(
      allModels,
      _.partialRight(_.pick, [
        'model',
        'plugin',
        'index',
        'migration',
        'pk',
        'enable',
      ])
    );
    return ctx.send(response);
  },
  fetchModel: async (ctx) => {
    const { index, _start, _limit } = ctx.query;
    let data;

    try {
      data = await strapi.elastic.search({
        index,
        size: _limit || 10,
        from: _limit * (_start - 1),
        body: {
          sort: [
            {
              updated_at: {
                order: 'desc',
              },
            },
          ],
          query: {
            match_all: {},
          },
        },
      });
    } catch (e) {
      return ctx.send({ data: null, total: 0 });
    }

    if (data.statusCode !== 200) return ctx.badRequest();

    const res = [];
    for (const item of data.body.hits.hits) {
      const source = item['_source'];
      if (!_.isEmpty(source)) {
        // remove one to many data
        const sourceKeys = Object.keys(source);

        for (const key of sourceKeys) {
          if (_.isArray(source[key])) {
            source[key] = 'Array';
          } else if (_.isObject(source[key])) {
            source[key] = 'Object';
          }
        }
        res.push(source);
      }
    }
    
    return ctx.send({ data: res, total: data.body.hits.total.value });
  },
};
