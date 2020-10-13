'use strict';

module.exports = {
  findModel: async ({ reqUrl, models }) => {
    /**
     * check all models
     */
    for (const model of models) {
      /**
       * check all urls defined for model
       */
      for (const url of model.urls) {
        // check url matching by regexp
        // need refactor
        const re = new RegExp(url);
        const status = re.test(reqUrl);

        if (status) return model;
      }
    }
  },
};
