const { elasticsearchManager } = require('../../services/core/middleware');

module.exports = (strapi) => ({
  // can also be async
  initialize() {
    strapi.app.use(async (ctx, next) => {
      await next();
      elasticsearchManager(ctx);
    });
  },
});
