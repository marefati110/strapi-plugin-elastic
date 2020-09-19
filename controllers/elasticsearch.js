'use strict';

const { cron } = require('../services/core/migration/');

module.exports = {
  index: async (ctx) => {
    await cron();
    ctx.send({
      message: 'Done.',
    });
  },
};
