'use strict';

const { setting } = strapi.config.elasticsearch;

const importToElasticsearch = async ({ index, service, withRelated }) => {
  let start = 0;

  // define variable for progress bar
  let index_length = await strapi.services[service].count();
  index_length = parseInt(index_length / setting.importLimit);

  let result = ['Initial value'];

  while (result.length !== 0) {
    const start_sql = Date.now();

    if (withRelated) {
      result = await strapi
        .query(service)
        .model.query((qb) => {
          qb.limit(setting.importLimit);
          qb.offset(setting.importLimit * start);
        })
        .fetchAll({
          withRelated: withRelated,
        });
      result = await result.toJSON();
    } else {
      result = await strapi.services[service].find({
        _start: setting.importLimit * start,
        _limit: setting.importLimit,
      });
    }

    //
    const end_sql = Date.now();
    //

    const body = result.flatMap((doc) => [
      { index: { _index: index, _id: doc.id } },
      doc,
    ]);

    const start_elastic = Date.now();
    //
    try {
      await strapi.elastic.bulk({ refresh: true, body });
    } catch (e) {
      strapi.log.error(e);
    }
    //
    const end_elastic = Date.now();
    //
    start++;
    // progress bar
    strapi.log.info(
      `(${start}/${
        index_length + 1
      }) imported to ${index} | sql query takes ${parseInt(
        (end_sql - start_sql) / 1000
      )}s and elasticsearch takes ${parseInt(
        (end_elastic - start_elastic) / 1000
      )}s `
    );
    //
  }
};

module.exports = { importToElasticsearch: importToElasticsearch };
