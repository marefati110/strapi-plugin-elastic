const { cron } = require('../services/core/migration');

module.exports = {
  index: async (ctx) => {
    cron();
    ctx.send({
      message: 'on progress',
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
