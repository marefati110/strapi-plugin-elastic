'use strict';

const { migrateModels } = require('../services/core/migration/');

module.exports = {
  index: async (ctx) => {
    migrateModels();
    ctx.send({
      message: 'On progress',
    });
  },
  customMigrate: async (ctx) => {
    /**
     * @param(index)
     * @param(service)
     * @param(withRelated) // optional
     * @param(importLimit) // optional
     */
    const params = ctx.request.body;
    await strapi.elastic.migrateModel(params);
    await ctx.send('ok');
  },
};
