'use strict';

module.exports = {
  migrateModel: async (targetModel) => {
    const { setting } = strapi.config.elasticsearch;
    const {
      index,
      model,
      relations,
      plugin,
      pk,
      conditions,
      importLimit,
    } = targetModel;
    
    let start = 0;

    // define variable for progress bar
    let index_length = await strapi.services[model].count();
    index_length = parseInt(
      index_length / (importLimit || setting.importLimit)
    );

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const start_sql = Date.now();

      const result = await strapi.query(model, plugin).find(
        {
          _limit: importLimit || setting.importLimit,
          _start: (importLimit || setting.importLimit) * start,
          ...conditions,
        },
        [...relations]
      );

      if (result.length === 0) return;
      //
      const end_sql = Date.now();
      //

      const body = result.flatMap((doc) => [
        { index: { _index: index, _id: doc[pk || 'id'] } },
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
  },
};
