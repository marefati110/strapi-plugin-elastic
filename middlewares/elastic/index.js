'use strict';

const { elasticsearchManager } = require('../../services/core/middlewares');

module.exports = (strapi) => {
  return {
    // can also be async
    initialize() {
      strapi.app.use(async (ctx, next) => {
        await next();
        elasticsearchManager(ctx);
      });
    },
  };
};
