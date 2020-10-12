'use strict';

const fs = require('fs');

module.exports = {
  generateConfig: async () => {
    const modelsConfig = [];
    const models = fs.readdirSync('/home/ali/app/doctop-backend/api');
    models.map((model) => {
      const config = modelConfigTemplate(model);
      modelsConfig.push(config);
    });
    const elasticsearchConfig = elasticsearchConfigTemplate(modelsConfig);
    // console.log(elasticsearchConfig);
    fs.watchFile('ali.js', elasticsearchConfig, (err) => {
      console.log(err);
    });
  },
};

const modelConfigTemplate = (model) => {
  return {
    model,
    plugin: null,
    enable: false,
    index: model,
    relations: [],
    conditions: {},
    fillByResponse: false,
    migration: false,
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
    validStatus: [200, 201],
    validMethod: ['PUT', 'POST', 'DELETE'],
    fillByResponse: false,
    importLimit: 3000,
    prefix: null,
    postfix: null,
    removeExistIndexForMigration: false,
  },
  models: ${modelsConfig}
});`;
