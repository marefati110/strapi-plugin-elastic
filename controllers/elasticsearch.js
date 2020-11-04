const _ = require('lodash');
const flatten = require('flat');
const { migrateAllModels } = require('../services/core/migration');

module.exports = {
  migrateAllModels: async (ctx) => {
    await ctx.send({
      message: 'on progress it can take a few minuets',
    });

    await migrateAllModels();
  },
  customMigrate: async (ctx) => {
    // request body style
    // }
    //   model: 'model',
    //   plugin: null,
    //   index: 'appointment',
    //   relations: [],
    //   conditions: {},
    // },

    const params = ctx.request.body;
    await strapi.elastic.migrateModel(params);
    await ctx.send('ok');
  },

  fetchModels: (ctx) => {
    const { models } = strapi.config.elasticsearch;

    const availableModels = models.filter((model) => model.enable === true);

    const response = _.map(
      availableModels,
      _.partialRight(_.pick, ['model', 'plugin', 'index', 'migration', 'pk'])
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
