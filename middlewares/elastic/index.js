const { elasticsearchManager } = require('../../services/core/middleware');

module.exports = (strapi) => ({
  initialize() {
    strapi.app.use(async (ctx, next) => {
      await next();
      elasticsearchManager(ctx);
    });
  },
});
