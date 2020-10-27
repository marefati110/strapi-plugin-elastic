<p align="center">
  <a href="" rel="noopener">
 <img src="https://i.ibb.co/zG6Nj3g/Untitled-1.jpg" alt="Project logo"></a>
</p>

<!-- <h3 align="center">strapi elasticsearch</h3> -->

<div align="center">

[![GitHub issues](https://img.shields.io/github/issues/marefati110/strapi-plugin-elasticsearch?style=flat-square)](https://github.com/marefati110/strapi-plugin-elasticsearch/issues)
[![GitHub forks](https://img.shields.io/github/forks/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch/network)
[![GitHub stars](https://img.shields.io/github/stars/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch/stargazers)
[![GitHub license](https://img.shields.io/github/license/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch)

</div>

<h1 align='center'>under construction</h1>

---

<p align="center"> Few lines describing your project.
    <br> 
</p>

## 📝 Table of Contents

- [Getting Started](#getting_started)
- [Usage](#usage)
- [Contributing Guide](#CONTRIBUTING)
- [Authors](#authors)

### Prerequisites

**This plugin has not been tested on mongodb**

Install plugin

- Go to the project path

  - `cd PROJECT/plugins`

- Clone the project

  - `git clone https://github.com/marefati110/strapi-plugin-elasticsearch.git`

- Install dependencies

  - `yarn install`

## 🏁 Getting Started <a name = "getting_started"></a>

- Go to `PROJECT/config/middleware.js` and add `"elastic"` to end of `load.before`
- enable `elastic` middleware in setting

<img src="https://i.ibb.co/BKqjPy0/code.png">

## 🎈 Usage <a name="usage"></a>

After the first run of the project, it creates a config file at `PROJECT/config/elasticsearch.js`

**config file should look like the image**

<img src="https://i.ibb.co/tPmhrJH/code2.png" >

the plugin look at `api` folder and generate config for each model

By default all settings are disabled for models and to activate it is enough to set enable to `true`

after restarting project indices of active models are made in elasticsearch

The settings of each model are as follows
‍‍‍‍‍

```js
  {
    model: 'modelName', // Project/api/**/models/MODEL.setting.json  info.name
    plugin: null, // plugin name if exist
    enable: false, // enable or disable model to sync with elasticsearch
    index: 'modelNameIndex', // index name in elasticsearch
    relations: [], // https://strapi.io/documentation/v3.x/concepts/queries.html#api-reference
    conditions: {}, // https://strapi.io/documentation/v3.x/concepts/queries.html#api-reference
    fillByResponse: false,
    migration: false
    urls: [], // some regexp
  },
```

Patterns(regexp) can be defined for urls in the settings of each model
This plugin finds the model of each request by matching the url of each request with the defined patterns.

if `fillByResponse` is enabled `ctx.body` or response is stored in the elastic
and if `fillByResponse` is disabled, it will first look for the `id` in `ctx.body`
`ctx.params` and `ctx.query`, then the data is taken from database and stored in the elastic.

## Contributing Guide <a name = "contributing"></a>

## ✍️ Authors <a name = ""></a>

- [@marefati110](https://github.com/marefati110)
