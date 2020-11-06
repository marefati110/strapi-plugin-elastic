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

    const response = _.map(
      models,
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

    const data = await strapi.elastic.search({
      index,
      size: _limit || 10,
      from: _limit * _start || 0,
      body: {
        query: {
          match_all: {},
        },
      },
    });

    if (data.statusCode !== 200) return ctx.badRequest();

    const res = [];
    for (const item of data.body.hits.hits) {
      const source = item['_source'];
      if (!_.isEmpty(source)) {
        res.push(flatten(source));
      }
    }

    return ctx.send({ data: res });
  },
};
