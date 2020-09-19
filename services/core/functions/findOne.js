'use strict';

const findOne = async (index, id) => {
  try {
    const elasticsearchResponse = await strapi.elastic.get({
      index: index,
      id: id,
    });
    return elasticsearchResponse;
  } catch (e) {
    return;
  }
};

module.exports = { findOne };
