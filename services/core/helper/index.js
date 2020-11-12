const axios = require('axios');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

function compareDataWithMap({ properties, docs }) {
  // initial variable;
  let outputDataType = 'array';
  let newMappings = false;

  const result = [];

  // convert docs(object) to array
  if (!_.isArray(docs)) {
    docs = [docs];

    // outputDataType use for remind input data type to return with same type
    outputDataType = 'object';
  }
  const propertiesKeys = Object.keys(properties);

  for (const doc of docs) {
    //
    const res = {};
    const dockKeyUsed = [];

    const docKeys = Object.keys(doc);

    for (const docKey of docKeys) {
      // check type of data with mapping in config

      if (propertiesKeys.includes(docKey)) {
        //

        const DOC = doc[docKey];
        const DOC_PROPERTY = properties[docKey].type;

        // recursive function for nested object/array
        if (
          _.isObject(DOC) &&
          _.isObject(properties[docKey].properties) &&
          !_.isDate(DOC) &&
          !_.isEmpty(DOC) &&
          !_.isEmpty(properties[docKey].properties)
        ) {
          const filteredData = compareDataWithMap({
            properties: properties[docKey].properties,
            docs: DOC,
          });

          if (!_.isEmpty(filteredData.result)) {
            // check all element
            const finalArray = [];
            if (_.isArray(filteredData.result)) {
              //
              filteredData.result.forEach((item) => {
                //
                if (!_.isEmpty(item)) {
                  //
                  finalArray.push(item);
                  //
                }
                //
              });
              //
              filteredData.result = finalArray;
              //
            }

            res[docKey] = filteredData.result;

            dockKeyUsed.push(docKey);
            //
          } else {
            //
            // res[docKey] = null;
            dockKeyUsed.push(docKey);
            //
          }
          newMappings = filteredData.newMappings;

          // check numbers
        } else if (_.isNumber(DOC) && DOC_PROPERTY === 'long') {
          //
          res[docKey] = DOC;
          dockKeyUsed.push(docKey);

          // check strings
        } else if (_.isString(DOC) && DOC_PROPERTY === 'text') {
          //
          res[docKey] = DOC;
          dockKeyUsed.push(docKey);

          // check boolean
        } else if (_.isBoolean(DOC) && DOC_PROPERTY === 'boolean') {
          //
          res[docKey] = DOC;
          dockKeyUsed.push(docKey);

          // check date
        } else if (_.isDate(DOC) && DOC_PROPERTY === 'date') {
          //
          res[docKey] = DOC;
          dockKeyUsed.push(docKey);

          // check date
        } else if (_.isString(DOC) && DOC_PROPERTY === 'date') {
          //
          res[docKey] = DOC;
          dockKeyUsed.push(docKey);

          // other types
        } else {
          //
          // res[docKey] = null;
          dockKeyUsed.push(docKey);
          //
        }
      } else {
        //
        //some logic
        //
      }
    }
    // push property that exist in mapping config but not in entered data
    const mainKeys = _.difference(propertiesKeys, dockKeyUsed);
    for (const key of mainKeys) {
      res[key] = null;
    }
    result.push(res);
  }
  // return data it depends on outputDataType
  if (outputDataType === 'array') {
    //
    return { result, newMappings };
    //
  } else if (outputDataType === 'object') {
    //
    return { result: result[0], newMappings };
    //
  }
}

const elasticsearchIndexConfigTemplate = (config) => `
module.exports = () => (${JSON.stringify(config)});
`;

module.exports = {
  checkEnableModels: async () => {
    const { models } = strapi.config.elasticsearch;

    const enableModels = models.filter((model) => model.enable === true);

    await enableModels.forEach(async (model) => {
      const indexName = model.index_postfix + model.index + model.index_postfix;
      try {
        await strapi.elastic.indices.create({ index: indexName });
        strapi.elastic.log.debug(`${model.index} index created.`);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
  },
  checkNewVersion: async () => {
    const { setting } = strapi.config.elasticsearch;

    const currentVersion = setting.version;

    const releases = await axios.default.get(
      'https://api.github.com/repos/marefati110/strapi-plugin-elastic/releases'
    );

    const lastVersion = releases.data[0];

    if (
      currentVersion !== lastVersion.tag_name &&
      lastVersion.prerelease === false
    ) {
      strapi.log.warn(
        'There is new version for strapi-plugin-elastic. please update plugin.'
      );
    }
  },
  compareDataWithMap,
  generateMappings: async ({ targetModels }) => {
    if (!_.isArray(targetModels)) targetModels = [targetModels];

    const configFilePath = path.resolve(__dirname, '../../../../../config');

    const indexConfig = strapi.config['elasticsearch.index.config'] || {};

    for (const targetModel of targetModels) {
      const map = await strapi.elastic.indices.getMapping({
        index: targetModel.index,
      });

      indexConfig[targetModel.index] = map.body[targetModel.index];
    }

    const config = elasticsearchIndexConfigTemplate(indexConfig);

    fs.writeFile(
      configFilePath + '/elasticsearch.index.config.js',
      config,
      (err) => {
        if (err) throw err;
      }
    );
  },
  removeIndexConfig: async ({ targetModels }) => {
    if (!_.isArray(targetModels)) targetModels = [targetModels];
    const configFilePath = path.resolve(__dirname, '../../../../../config');

    const indexConfig = strapi.config['elasticsearch.index.config'];

    for (const targetModel of targetModels) {
      delete indexConfig[targetModel.index][targetModel.index];
    }

    const config = elasticsearchIndexConfigTemplate(indexConfig);

    fs.writeFile(
      configFilePath + '/elasticsearch.index.config.js',
      config,
      (err) => {
        if (err) throw err;
      }
    );
  },
  generateIndexConfig: async ({ data }) => {
    await strapi.elastic.index({
      index: 'strapi_elastic_lab',
      body: data,
    });

    let map = await strapi.elastic.indices.getMapping({
      index: 'strapi_elastic_lab',
    });

    await strapi.elastic.indices.delete({
      index: 'strapi_elastic_lab',
    });

    map = map.body['strapi_elastic_lab'];
    const res = {};
    res.INDEX_NAME = map;

    return res;
  },
};
