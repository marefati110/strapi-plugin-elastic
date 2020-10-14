const createOrUpdate = async (index, id, data) => {
  let elasticsearchResponse;

  try {
    elasticsearchResponse = await strapi.elastic.update({
      id,
      index,
      body: {
        doc: data,
        doc_as_upsert: true,
      },
    });
  } catch (e) {
    strapi.log.error(e.message);
  }

  if (elasticsearchResponse) {
    return true;
  }
  return false;
};

module.exports = { createOrUpdate };
