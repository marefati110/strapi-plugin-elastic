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

const modelConfigTemplate = (model) => ({
  model,
  index: model,
  plugin: null,
  enable: false,
  migration: false,
  pk: 'id',
  relations: [],
  conditions: {},
  fillByResponse: true,
  supportAdminPanel: true,
  urls: [],
});

const elasticsearchConfigTemplate = (modelsConfig) => `
module.exports = ({ env }) => ({
  connection: {
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/auth-reference.html
    node: env('ELASTICSEARCH_HOST', 'http://127.0.0.1:9200'),
  },
  setting: {
    validStatus: [200, 201],
    validMethod: ['PUT', 'POST', 'DELETE'],
    importLimit: 3000,
    index_postfix: '',
    index_postfix: '',
    removeExistIndexForMigration: false,
  },
  models: ${JSON.stringify(modelsConfig, null, 4)}
});`;

module.exports = {
  generateMainConfig: () => {
    const rootPath = path.resolve(__dirname, '../../../../../');
    const configPath = rootPath + '/config/elasticsearch.js';

    fs.mkdirSync(rootPath + '/exports/elasticsearch', { recursive: true });

    const existConfigFile = fs.existsSync(configPath);

    if (!existConfigFile) {
      const models = fs.readdirSync(rootPath + '/api');

      const modelsConfig = [];

      models.map((model) => {
        const config = modelConfigTemplate(model);
        modelsConfig.push(config);
      });

      const elasticsearchConfig = elasticsearchConfigTemplate(modelsConfig);
      fs.writeFile(configPath, elasticsearchConfig, (err) => {
        if (err) throw err;
      });
    }
  },
  generateMappings: async ({ targetModels, data }) => {
    if (!_.isArray(targetModels)) targetModels = [targetModels];

    const rootPath = path.resolve(__dirname, '../../../../../');
    const exportPath = `${rootPath}/exports/elasticsearch`;

    for (const targetModel of targetModels) {
      let map = {};

      // get mapping;
      if (!data) {
        map = await strapi.elastic.indices.getMapping({
          index: targetModel.index,
        });
      }

      if ((map && map.body) || data) {
        fs.writeFile(
          `${exportPath}/${targetModel.model}.index.json`,
          JSON.stringify(map.body || data, null, 2),
          (err) => {
            if (err) throw err;
          }
        );
      }
      //
    }
  },
  checkEnableModels: async () => {
    const { models } = strapi.config.elasticsearch;

    const enableModels = models.filter((model) => model.enable === true);

    await enableModels.forEach(async (model) => {
      const indicesMapping = {};
      // const indexName = model.index_postfix + model.index + model.index_postfix;
      try {
        const indexMap = await strapi.elastic.indices.getMapping({
          index: model.index,
        });

        if (indexMap.status === 200) {
          indicesMapping[model.index] = indexMap.body;
        }
      } catch (e) {}

      strapi.elastic.indicesMapping = indicesMapping;
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
  initialStrapi: async () => {
    // const indicesMapping = {};
    // const indexFilePattern = /([a-zA-z0-9-_]*)\.index\.json/;

    // const rootPath = path.resolve(__dirname, '../../../../../');
    // const exportPath = `${rootPath}/exports/elasticsearch`;

    // const indicesMapConfigFile = fs.readdirSync(exportPath);

    const { models } = strapi.config.elasticsearch;
    const indicesMapping = {};

    const enableModels = models.filter((model) => model.enable === true);

    for (const model of enableModels) {
      try {
        const indexMap = await strapi.elastic.indices.getMapping({
          index: model.index,
        });

        if (indexMap.statusCode === 200) {
          indicesMapping[model.index] = indexMap.body[model.index];
        }
      } catch (e) {}
    }
    strapi.elastic.indicesMapping = indicesMapping;

    // indicesMapConfigFile.forEach((index) => {
    //   if (indexFilePattern.test(index)) {
    //     const map = require(`${exportPath}/${index}`);
    //     const [, model] = index.match(indexFilePattern);
    //     indicesMapping[model] = map;
    //   }
    // });

    // strapi.elastic.indicesMapping = indicesMapping;
  },
  compareDataWithMap,
};
