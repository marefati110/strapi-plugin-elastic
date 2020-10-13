'use strict';

const { findModel } = require('./helpers');

module.exports = {
  elasticsearchManager: async (ctx) => {
    /*
     * request validation
     */
    if (!checkRequest(ctx)) {
      return;
    }

    /*
     * define requirement variables
     */
    const url = ctx.request.url;

    // import config from config file
    const { setting, models } = strapi.config.elasticsearch;

    // find target model of request
    const targetModel = await findModel({
      models: models,
      reqUrl: url,
    });
    if (!targetModel) return;

    // save response data to body variable - use when fillByResponse set to true
    const body = ctx.response.body;

    // find id of record
    const pk = targetModel.pk || 'id';
    const id = body[pk] || ctx.params[pk] || ctx.query[pk];

    /*
     * method validation
     */
    const postOrPutMethod =
      ctx.request.method === 'POST' || ctx.request.method === 'PUT';

    const deleteMethod = ctx.request.method === 'DELETE';
    /*
     * insert or update data
     */
    if (postOrPutMethod) {
      let data;
      /*
       * collect data to insert to elasticsearch
       */
      if (setting.fillByResponse) {
        /*
         * fetch data from response body
         */
        data = body;
        //
      } else if (!setting.fillByResponse) {
        /*
         * fetch data by id using conditions and relation
         * defined in elasticsearch.js config file for model.
         */
        data = await strapi
          .query(targetModel.model, targetModel.plugin)
          .findOne({ id: id, ...targetModel.conditions }, [
            ...targetModel.relations,
          ]);
      }
      /*
       * insert data to elasticsearch
       */
      return strapi.elastic.createOrUpdate(targetModel.index, id, data);
    }
    /*
     * delete data from elasticsearch
     */
    if (deleteMethod) {
      return strapi.elastic.destroy(targetModel.index, id);
    }
  },
};

function checkRequest(ctx) {
  const { setting } = strapi.config.elasticsearch;
  let status = false;
  if (
    setting.validMethod.includes(ctx.request.method) &&
    setting.validStatus.includes(ctx.response.status)
  )
    status = true;

  return status;
}
