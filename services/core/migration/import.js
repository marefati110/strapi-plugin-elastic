const { setting } = strapi.config.elasticsearch;

const importToElasticsearch = async ({
  index,
  service,
  withRelated,
  importLimit,
}) => {
  let start = 0;

  // define variable for progress bar
  let index_length = await strapi.services[service].count();
  index_length = parseInt(index_length / (importLimit || setting.importLimit));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let result = [];

    const start_sql = Date.now();

    if (withRelated) {
      result = await strapi
        .query(service)
        .model.query((qb) => {
          qb.limit(importLimit || setting.importLimit);
          qb.offset((importLimit || setting.importLimit) * start);
        })
        .fetchAll({
          withRelated,
        });
      result = await result.toJSON();
    } else {
      result = await strapi.services[service].find({
        _start: (importLimit || setting.importLimit) * start,
        _limit: importLimit || setting.importLimit,
      });
    }

    if (result.length === 0) return;
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
        (end_sql - start_sql) / 1000,
      )}s and elasticsearch takes ${parseInt(
        (end_elastic - start_elastic) / 1000,
      )}s `,
    );
    //
  }
};

module.exports = { importToElasticsearch };
