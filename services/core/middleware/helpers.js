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
};
