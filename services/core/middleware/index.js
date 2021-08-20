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
    //
    const isValidReq = checkRequest(ctx);

    if (!isValidReq) return;

    const { url } = ctx.request;

    const { models } = strapi.config.elasticsearch;

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

    targetModel =
      targetModel ||
      (await findModel({
        models,
        reqUrl: url,
      }));

    if (!targetModel) return;

    // set default

    targetModel.fillByResponse = !_.isEmpty(targetModel.fillByResponse)
      ? targetModel.fillByResponse
      : true;

    //

    const { body } = ctx;

    // find id of record
    const pk = targetModel.pk || 'id';

    const { id } =
      _.pick(body, pk) || _.pick(ctx.params, pk) || _.pick(ctx.query, pk);

    const postOrPutMethod =
      ctx.request.method === 'POST' || ctx.request.method === 'PUT';

    const deleteMethod = ctx.request.method === 'DELETE';

    let deleteIds;
    if (deleteMethod) {
      deleteIds = await getDeleteIds({ reqUrl: url, body: ctx.body });
    }

    if (postOrPutMethod && id) {
      //

      let data;

      if (targetModel.fillByResponse) {
        //

        data = body;

        //
      } else if (!targetModel.fillByResponse) {
        //

        data = await strapi
          .query(targetModel.model, targetModel.plugin)
          .findOne({ id, ...targetModel.conditions }, [
            ...targetModel.relations,
            'created_by',
            'updated_by',
          ]);

        //
      }

      console.log(data, 'data');

      await strapi.elastic.createOrUpdate(targetModel.model, { id, data });

      //
    } else if (deleteMethod && (id || deleteIds)) {
      //

      const id_in = !_.isEmpty(deleteIds) ? deleteIds : [id];

      await strapi.elastic.destroy(targetModel.model, { id_in });

      //
    }
  },
};
