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
      model.urls.forEach((url) => {
        const re = new RegExp(url);
        const status = re.test(reqUrl);
        if (status && model.enable) res = model;
      });
    });
    //
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
