'use strict';

const { elasticsearchManager } = require('../../services/core/middleware');

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
