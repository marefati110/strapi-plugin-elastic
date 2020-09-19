'use strict';

const destroy = async (index, id) => {
  let elasticsearchResponse;
  try {
    elasticsearchResponse = await strapi.elastic.delete({
      id: id,
      index: index,
    });
  } catch (e) {
    console.error(e.message);
  }

  if (elasticsearchResponse) {
    return true;
  } else {
    return false;
  }
};

module.exports = { destroy };
