const _ = require('lodash');

const {
  findModel,
  isContentManagerUrl,
  isDeleteAllUrl,
  getDeleteIds,
  checkRequest,
} = require('./helpers');

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
    const { url } = ctx.request;

    // import config from config file
    const { setting, models } = strapi.config.elasticsearch;

    // try match reqUrl to content manager plugin
    let targetModel = await isContentManagerUrl({
      models,
      reqUrl: url,
    });

    targetModel =
      targetModel ||
      (await isDeleteAllUrl({
        models,
        reqUrl: url,
      }));

    // find target model of request
    targetModel =
      targetModel ||
      (await findModel({
        models,
        reqUrl: url,
      }));

    if (!targetModel) return;

    // save response data to body variable - use when fillByResponse set to true
    const { body } = ctx;
    const deleteIds = await getDeleteIds({ reqUrl: url, query: ctx.query });
    // find id of record
    const pk = targetModel.pk || 'id';
    const { id } =
      _.pick(body, pk) || _.pick(ctx.params, pk) || _.pick(ctx.query, pk);
    /*
     * method validation
     */
    const postOrPutMethod =
      ctx.request.method === 'POST' || ctx.request.method === 'PUT';

    const deleteMethod = ctx.request.method === 'DELETE';
    /*
     * insert or update data
     */
    if (postOrPutMethod && id) {
      let data;
      /*
       * collect data to insert to elasticsearch
       */
      if (targetModel.fillByResponse) {
        /*
         * fetch data from response body
         */
        data = body;
        //
      } else if (!targetModel.fillByResponse) {
        /*
         * fetch data by id using conditions and relation
         * defined in elasticsearch.js config file for model.
         */

        data = await strapi
          .query(targetModel.model, targetModel.plugin)
          .findOne({ id, ...targetModel.conditions }, [
            ...targetModel.relations,
            'created_by',
            'updated_by',
          ]);
      }
      /*
       * insert data to elasticsearch
       */

      await strapi.elastic.createOrUpdate(targetModel.model, { id, data });
    }
    /*
     * delete data from elasticsearch
     */
    if (deleteMethod && (id || deleteIds)) {
      const id_in = deleteIds.length !== 0 ? deleteIds : [id];
      await strapi.elastic.destroy(targetModel.model, { id_in });
    }
  },
};
