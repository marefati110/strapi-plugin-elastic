'use strict';

const createOrUpdate = async (index, id, data) => {
  let elasticsearchResponse;

  try {
    elasticsearchResponse = await strapi.elastic.update({
      id: id,
      index: index,
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
  } else {
    return false;
  }
};

module.exports = { createOrUpdate };
