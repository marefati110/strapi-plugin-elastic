const _ = require('lodash');

module.exports = {
  checkRequest: (ctx) => {
    const { setting } = strapi.config.elasticsearch;

    setting.validMethod = setting.validMethod || ['PUT', 'POST', 'DELETE'];
    setting.validStatus = setting.validStatus || [200, 201];

    return (
      setting.validMethod.includes(ctx.request.method) &&
      setting.validStatus.includes(ctx.response.status)
    );
  },
  findModel: async ({ reqUrl, models }) => {
    let res;

    await models.forEach((model) => {
      model.urls.forEach((items) => {
        const re = new RegExp(items);
        if (_.isString(items)) {
          const status = re.test(reqUrl);
          if (status && model.enabled) {
            const targetModel = model;
            res = targetModel;
          }
        } else if (_.isObject(items)) {
          const urls = Object.keys(items);
          for (const url of urls) {
            const re = new RegExp(url);
            const status = re.test(reqUrl);

            if (status && model.enabled) {
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
    //
    const contentManagerUrlPattern = /\/content-manager\/collection-types\/([a-zA-Z-_]+)::([a-zA-Z-_]+).(\w+)\/(\d+)/;

    const result = reqUrl.match(contentManagerUrlPattern);

    if (!result) return;

    const [, , , model] = result;

    const targetModel = await models.find((item) => item.model === model);

    if (
      !targetModel ||
      targetModel.enabled !== true ||
      targetModel.supportAdminPanel !== true
    )
      return;

    return targetModel;
  },
  isDeleteAllUrl: async ({ models, reqUrl }) => {
    const contentManagerUrlPattern = /^\/content-manager\/collection-types\/(\w+)\/\w*::([a-zA-Z-]+).(\w+)|\/(\d*)/;

    const result = reqUrl.match(contentManagerUrlPattern);

    if (!result) return;

    const [, , , model] = result;

    const targetModel = await models.find(
      (configModel) => configModel.model === model
    );

    if (
      !targetModel ||
      targetModel.enabled === false ||
      targetModel.supportAdminPanel === false
    )
      return;

    return targetModel;
  },
  getDeleteIds: async ({ body, reqUrl }) => {
    const contentManagerUrlPattern = /\/content-manager\/collection-types\/(\w+)::([a-zA-Z-_]+).([a-zA-Z-_]+)\/actions\/bulkDelete/;

    const result = contentManagerUrlPattern.test(reqUrl);

    if (!result || !body) return;

    const ids = [];

    for (const data of body) {
      ids.push(data.id);
    }

    return ids;
  },
};
//
