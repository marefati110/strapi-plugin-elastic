const { createOrUpdate } = require('../functions/CreateOrUpdate');
const { destroy } = require('../functions/Delete');

const { setting, urls, adminUrls } = strapi.config.elasticsearch;

const urlIdPattern = /\d*$/;
const urlIndexPattern = /^\/(\w+)/;
const adminUrlIndexPattern = /::(.+)\./;

function checkRequest(ctx) {
  let status = false;
  if (
    ctx.request
    && setting.validMethod.includes(ctx.request.method)
    && urlIdPattern.test(ctx.request.url)
    && urlIndexPattern.test(ctx.request.url)
    && setting.validStatus.includes(ctx.response.status)
  ) status = true;

  //
  return status;
}

module.exports = {
  elasticsearchManager: async (ctx) => {
    // validation
    if (!checkRequest(ctx)) return;
    // extract data from url
    const { url } = ctx.request;
    const { body } = ctx.response;
    const apiName = url.match(urlIndexPattern) || [];
    const urlID = url.match(urlIdPattern) || [];
    const adminApiName = url.match(adminUrlIndexPattern) || [];

    const index_ = urls[apiName[1]] || adminUrls[adminApiName[1]] || false;

    if (!index_) return;

    // define main variables
    const id = body.id || ctx.params.id || urlID[0];
    const { index } = index_;
    const { withRelated } = index_;
    //
    if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
      let data;
      if (setting.fillByResponse === true) {
        data = body;
        //
      } else if (setting.fillByResponse === false && withRelated) {
        //
        const raw_data = await strapi
          .query(index_.service)
          .model.query((qb) => {
            qb.where('id', '=', id);
          })
          .fetch({
            withRelated,
          });
        data = await raw_data.toJSON();
        //
      } else if (setting.fillByResponse === false && !withRelated) {
        data = await strapi.services[index_.service].findOne({ id }, []);
      }

      return await createOrUpdate(index, id, data);
      //
    }
    // delete data
    if (ctx.request.method === 'DELETE') return await destroy(index, id);
  },
};
