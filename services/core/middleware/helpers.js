module.exports = {
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

    if (!targetModel.enable) return;

    return targetModel;
  },
};
