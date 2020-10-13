'use strict';

module.exports = {
  findModel: async ({ reqUrl, models }) => {
    /*
     * check all models
     */
    for (const model of models) {
      /*
       *  skip all disable models
       */
      if (model.enable === false) continue;
      /*
       * check all urls defined for model
       */
      for (const url of model.urls) {
        /*
         * all url are regExp pattern
         */
        const re = new RegExp(url);

        const status = re.test(reqUrl);

        if (status) return model;
      }
    }
  },
};
