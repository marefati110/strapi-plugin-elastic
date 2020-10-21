module.exports = {
  findModel: async ({ reqUrl, models }) => {
    let result;
    /**
     * check all models
     */
    models.forEach((model) => {
      /**
       * check all urls defined for model
       */
      model.urls.forEach((url) => {
        // check url matching by regexp
        // need refactor
        const re = new RegExp(url);
        const status = re.test(reqUrl);

        if (status) result = model;
      });
    });
    //
    return result;
  },
};
