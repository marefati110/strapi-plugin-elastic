const migrateModel = async (model, params = {}) => {
  // specific condition
  params.conditions = params.conditions || {};

  const { models, setting } = strapi.config.elasticsearch;
  const targetModel = models.find((item) => item.model === model);

  if (
    !targetModel ||
    targetModel.enable === false ||
    targetModel.migration === false
  )
    return null;

  let start = 0;
  strapi.elastic.log.debug(`Importing ${targetModel.model} to elasticsearch`);
  // define variable for progress bar
  let index_length = await strapi.services[targetModel.model].count();
  index_length = parseInt(index_length / setting.importLimit);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const start_sql = Date.now();

    strapi.log.debug(`Getting ${targetModel.model} model data from database`);
    const result = await strapi
      .query(targetModel.model, targetModel.plugin)
      .find(
        {
          _limit: setting.importLimit,
          _start: setting.importLimit * start,
          ...targetModel.conditions,
          ...params.conditions,
        },
        [...targetModel.relations]
      );

    if (result.length === 0) {
      return;
    }

    //
    const end_sql = Date.now();
    //

    const body = await result.flatMap((doc) => [
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
      strapi.log.debug(
        `Sending ${targetModel.model} model to elasticsearch...`
      );
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
const migrateModels = async (params = {}) => {
  const { setting, models } = strapi.config.elasticsearch;

  params.models = params.models || [];
  params.conditions = params.conditions || {};

  // remove elasticsearch index before migration
  if (setting.removeExistIndexForMigration) {
    await models.forEach(async (model) => {
      if (model.enable && model.migration) {
        await strapi.elastic.indices.delete({ index: model.index });
      }
    });
  }

  if (params.models.length !== 0) {
    const targetModels = models.filter((item) =>
      params.models.includes(item.model)
    );

    // call migrateModel function for each model
    for (const item of targetModels) {
      await migrateModel(item.model, params.conditions);
    }
  } else {
    // call migrateModel function for each model
    for (const item of models) {
      await migrateModel(item.model, params.conditions);
    }
  }

  strapi.log.info(`All models imported...`);
};

module.exports = { migrateModels, migrateModel };
