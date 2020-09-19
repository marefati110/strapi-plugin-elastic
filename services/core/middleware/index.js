'use strict';

const { createOrUpdate } = require('../functions/CreateOrUpdate');
const { destroy } = require('../functions/Delete');
const { setting, urls, adminUrls } = strapi.config.elasticsearch;

const urlIdPattern = /\d*$/,
  urlIndexPattern = /^\/(\w+)/,
  adminUrlIndexPattern = /::(.+)\./;

const elasticsearchManager = async (ctx) => {
  // validation
  if (
    !(
      ctx.request &&
      setting.validMethod.includes(ctx.request.method) &&
      urlIdPattern.test(ctx.request.url) &&
      urlIndexPattern.test(ctx.request.url) &&
      setting.validStatus.includes(ctx.response.status)
    )
  )
    return;
  // extract data from url
  const url = ctx.request.url,
    body = ctx.response.body,
    apiName = url.match(urlIndexPattern) || [],
    urlID = url.match(urlIdPattern) || [],
    adminApiName = url.match(adminUrlIndexPattern) || [];

  const index_ = urls[apiName[1]] || adminUrls[adminApiName[1]] || false;

  if (!index_) return;

  // define main variables
  const id = body.id || ctx.params.id || urlID[0],
    index = index_.index,
    withRelated = index_.withRelated;

  if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
    let data;
    if (setting.fillByResponse === true) {
      data = body;
    } else if (setting.fillByResponse === false) {
      if (withRelated) {
        const raw_data = await strapi
          .query(index_.infoName)
          .model.query((qb) => {
            qb.limit(1);
            qb.where('id', '=', id);
          })
          .fetch({
            withRelated: withRelated,
          });
        data = await raw_data.toJSON();
      } else if (!withRelated) {
        data = await strapi.services[index_.infoName].findOne({ id: id });
      }
    }
    return await createOrUpdate(index, id, data);
  } else if (ctx.request.method === 'DELETE') {
    return await destroy(index, id);
  } else return;
};

module.exports = { elasticsearchManager };
