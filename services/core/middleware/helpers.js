const _ = require('lodash');

module.exports = {
  checkRequest: (ctx) => {
    const { setting } = strapi.config.elasticsearch;
    let status = false;
    if (
      setting.validMethod.includes(ctx.request.method) &&
      setting.validStatus.includes(ctx.response.status)
    )
      status = true;

    return status;
  },
  findModel: async ({ reqUrl, models }) => {
    let res;

    await models.forEach((model) => {
      model.urls.forEach((items) => {
        const re = new RegExp(items);
        if (_.isString(items)) {
          const status = re.test(reqUrl);
          if (status && model.enable) {
            const targetModel = model;
            res = targetModel;
          }
        } else if (_.isObject(items)) {
          const urls = Object.keys(items);
          for (const url of urls) {
            const re = new RegExp(url);
            const status = re.test(reqUrl);

            if (status && model.enable) {
              const targetModel = model;
              targetModel.pk = items[url].pk;
              targetModel.relations = items[url].relations || [];
              targetModel.conditions = items[url].conditions || {};
              targetModel.fillByResponse = items[url].fillByResponse || true;
              res = targetModel;
            }
          }
        }
      });
    });
    return res;
  },
  isContentManagerUrl: async ({ models, reqUrl }) => {
    const contentManagerUrlPattern = /^\/content-manager\/explorer\/(\w+)::([a-zA-Z-]+).(\w+)|\/(\d*)/;

    const result = reqUrl.match(contentManagerUrlPattern);

    if (!result) return;

    const [, , , model] = result;

    const targetModel = await models.find(
      (configModel) => configModel.model === model
    );

    if (
      !targetModel ||
      targetModel.enable === false ||
      targetModel.supportAdminPanel === false
    )
      return;

    return targetModel;
  },
  isDeleteAllUrl: async ({ models, reqUrl }) => {
    const contentManagerUrlPattern = /^\/content-manager\/explorer\/(\w+)\/\w*::([a-zA-Z-]+).(\w+)|\/(\d*)/;

    const result = reqUrl.match(contentManagerUrlPattern);

    if (!result) return;

    const [, , , model] = result;

    const targetModel = await models.find(
      (configModel) => configModel.model === model
    );

    if (
      !targetModel ||
      targetModel.enable === false ||
      targetModel.supportAdminPanel === false
    )
      return;

    return targetModel;
  },
  getDeleteIds: async ({ query, reqUrl }) => {
    const contentManagerUrlPattern = /^\/content-manager\/explorer\/(\w+)\/\w*::([a-zA-Z-]+).(\w+)|\/(\d*)/;

    const result = contentManagerUrlPattern.test(reqUrl);

    if (!result || !query) return;

    const ids = [];
    const keys = Object.keys(query);
    for (const key of keys) {
      ids.push(+query[key]);
    }

    return ids;
  },
};
//
