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

const modelConfigTemplate = (model) => ({
  model,
  pk: 'id',
  plugin: null,
  enable: false,
  index: model,
  relations: [],
  conditions: {},
  fillByResponse: true,
  migration: false,
  supportAdminPanel: true,
  supportDefaultApis: true,
  urls: [],
});

// its better to generate beauty object

const elasticsearchConfigTemplate = (modelsConfig) => `
module.exports = ({ env }) => ({
  connection: {
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/auth-reference.html
    node: env('ELASTICSEARCH_HOST', 'http://127.0.0.1:9200'),
  },
  setting: {
    configVersion: 1,
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
