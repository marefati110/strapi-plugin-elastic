const migrateModel = async (model) => {
  const { models, setting } = strapi.config.elasticsearch;
  const targetModel = models.find((item) => item.model === model);

  if (!targetModel || !targetModel.enable || !targetModel.migration)
    return null;

  let start = 0;

  // define variable for progress bar
  let index_length = await strapi.services[targetModel.model].count();
  index_length = parseInt(index_length / setting.importLimit);

  strapi.elastic.log.debug(`Importing ${targetModel.model} to elasticsearch`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const start_sql = Date.now();

    const result = await strapi
      .query(targetModel.model, targetModel.plugin)
      .find(
        {
          _limit: setting.importLimit,
          _start: setting.importLimit * start,
          ...targetModel.conditions,
        },
        [...targetModel.relations]
      );

    if (result.length === 0) return;
    //
    const end_sql = Date.now();
    //

    const body = result.flatMap((doc) => [
      {
        index: {
          _index: targetModel.index,
          _id: doc[targetModel.pk || 'id'],
        },
      },
      doc,
    ]);
    //
    const start_elastic = Date.now();
    //
    try {
      await strapi.elastic.bulk({ refresh: true, body });
    } catch (e) {
      strapi.elastic.log.error(e);
    }
    //
    const end_elastic = Date.now();
    //
    start++;
    // progress bar
    strapi.log.info(
      `(${start}/${index_length + 1}) Imported to ${
        targetModel.index
      } index | sql query took ${parseInt(
        (end_sql - start_sql) / 1000
      )}s and insert to elasticsearch took ${parseInt(
        (end_elastic - start_elastic) / 1000
      )}s`
    );
    //
  }
};
const migrateModels = async () => {
  const { setting, models } = strapi.config.elasticsearch;

  // remove elasticsearch index before migration
  // function will execute for all models
  if (setting.removeExistIndexForMigration) {
    await models.forEach(async (model) => {
      if (model.enable && model.migration) {
        await strapi.elastic.indices.delete({ index: model.index });
      }
    });
  }

  // call migrateModel function for each model
  await models.forEach(async (model) => {
    await migrateModel(model);
  });
};

module.exports = { migrateModels, migrateModel };
