const destroy = async (index, id) => {
  let elasticsearchResponse;
  try {
    elasticsearchResponse = await strapi.elastic.delete({
      id,
      index,
    });
  } catch (e) {
    console.error(e.message);
  }

  if (elasticsearchResponse) {
    return true;
  }
  return false;
};

module.exports = { destroy };
