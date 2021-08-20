const { elasticsearchManager } = require('../../services');

module.exports = (strapi) => ({
  initialize() {
    strapi.app.use(async (ctx, next) => {
      await next();
      elasticsearchManager(ctx);
    });
  },
});
