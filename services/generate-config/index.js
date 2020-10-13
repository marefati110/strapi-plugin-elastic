'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  generateConfig: async () => {
    const configFileName = '/elasticsearch.js';
    const configFilePath = path.resolve(__dirname, '../../../../config');

    const existConfigFile = fs.existsSync(configFilePath + configFileName);

    if (!existConfigFile) {
      const modelsPath = path.resolve(__dirname, '../../../../api');
      const models = fs.readdirSync(modelsPath);

      const modelsConfig = [];

      models.map((model) => {
        const config = modelConfigTemplate(model);
        modelsConfig.push(config);
      });

      const elasticsearchConfig = elasticsearchConfigTemplate(modelsConfig);
      console.log(configFilePath + configFileName);
      fs.writeFile(
        configFilePath + configFileName,
        elasticsearchConfig,
        (err) => {
          if (err) throw err;
        }
      );
    }
  },
};

const modelConfigTemplate = (model) => {
  return {
    model,
    pk: 'id',
    plugin: null,
    enable: false,
    index: model,
    relations: [],
    conditions: {},
    fillByResponse: false,
    migration: false,
    urls: [],
  };
};

const elasticsearchConfigTemplate = (modelsConfig) => `
module.exports = ({ env }) => ({
  connection: {
    node: env('ELASTICSEARCH_HOST'),
    auth: {
      username: env('ELASTICSEARCH_USERNAME'),
      password: env('ELASTICSEARCH_PASSWORD'),
    },
  },
  setting: {
    version: 1,
    validStatus: [200, 201],
    validMethod: ['PUT', 'POST', 'DELETE'],
    fillByResponse: false,
    importLimit: 3000,
    prefix: null,
    postfix: null,
    removeExistIndexForMigration: false,
  },
  models: ${JSON.stringify(modelsConfig)}
});`;
