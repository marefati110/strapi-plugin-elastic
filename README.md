<p align="center">
  <a href="https://github.com/marefati110/strapi-plugin-elastic" rel="noopener">
 <img src="https://i.ibb.co/zG6Nj3g/Untitled-1.jpg" alt="Project logo"></a>
  <br/>
  <br/>
  <img width="90%" align="center" src="https://i.ibb.co/PwdPtP7/2020-12-21-22-18.png" alt="plugin" border="1">
</p>

<div align="center">

[![GitHub issues](https://img.shields.io/github/issues/marefati110/strapi-plugin-elasticsearch?style=flat-square)](https://github.com/marefati110/strapi-plugin-elasticsearch/issues)
[![GitHub forks](https://img.shields.io/github/forks/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch/network)
[![GitHub stars](https://img.shields.io/github/stars/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch/stargazers)
[![GitHub license](https://img.shields.io/github/license/marefati110/strapi-plugin-elasticsearch)](https://github.com/marefati110/strapi-plugin-elasticsearch)

</div>
<hr >
<h4 align="center">
tested on strapi v3.x

latest test: v3.4.0

</h4>
<bt/>
<h4 align="center">
  This plugin has not been tested on mongodb
</h4>
<hr/>
<br/>
<p align="center"> 
  The purpose of developing this plugin is to use the elastic search engine in Strapi to help the application development process
</p>

## 📝 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting_started)
- [How plugin work](#how_work)
- [Usage](#usage)
  - [scenario 1](#scenario-1)
  - [scenario 2](#scenario-2)
  - [scenario 3](#scenario-3)
  - [scenario 4](#scenario-4)
- [Functions](#functions)
- [Api](#api)
- [Example](#example)
- [Logging](#logging)
- [Authors](#authors)

## Prerequisites <a name="prerequisites"></a>

<hr />

Install Elasticsearch - https://www.elastic.co/downloads/elasticsearch

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

<p align="center">
<img src="https://i.ibb.co/kS5Cb1t/code4.png" alt="code4" border="0">
<br>
final result should be like the image
</p>

<hr/>

# How plugin works? <a name="how_work"></a>

After the first run of the project, it creates a config file at `PROJECT/config/elasticsearch.js`

**config file should look like the image**

<p align="center">
<img src="https://i.ibb.co/2yCbbmp/code3.png" alt="code3" border="0">
</p>

By default, syncing occurs in two ways

The answer of any request that makes a change in the model is stored in Elasticsearch this is especially true for the Strap panel admin

Or in response to any request, search for the pk of model the model in which the change was made, and after retrieving the information from the database, stores it in the elasticsearch

In the following, solutions are prepared for more complex scenarios.

After installing the plugin and running it, it creates an config file in the `PROJECT/config/elasticsearch.js`

In the connections section, the settings related to the connection to the elasticsearch are listed, there is also a help link

In the setting section, there are the initial settings related to the elastic plugin.

In the models section for all models in the `Project/api/**` path there is a model being built and you can change the initial settings

<hr/>

# 🎈 Usage <a name="usage"></a>

### Scenario 1 <a name="scenario-1"></a>

For example, we want to make changes to the article model and then see the changes in the Elasticsearch.

The first step is to activate in the settings related to this model

After saving and restarting the plugin, it creates an index for this model in the elasticsearch.

Note that the name selected for the index can be changed in the settings of the model.

At the end of the settings should be as follows

```js
{
  model: 'article',
  pk: 'id',
  plugin: null, // changed to true
  enable: true,
  index: 'article',
  relations: [],
  conditions: {},
  supportAdminPanel: true,
  fillByResponse: true,
  migration: false,
  urls: [],
},
```

Now in the strapi admin panel, by making an creating , deleting or updating , you can see the changes in Elasticsearch.

### Scenario 2 <a name="scenario-2"></a>

In this scenario, we want to make a change in the model using the rest api and see the result in Elasticsearch.

After sending a post request to `/articles`, changes will be applied and we will receive a response to this

```json
{
  "id": 1,
  "title": "title",
  "content": "content"
}
```

and model config should change to

```js
{
  model: 'article',
  pk: 'id',
  plugin: null,
  enable: true,
  index: 'article',
  relations: [],
  conditions: {},
  supportAdminPanel: true,
  fillByResponse: true, // default value
  migration: false,
  urls: ['/articles'], //changed
},
```

If the `fillByResponse` settings are enabled for the model, the same data will be stored in Elasticsearch, otherwise the data will be retrieved from the database using pk and stored in Elasticsearch.

### Scenario 3 <a name="scenario-3"></a>

This scenario is quite similar to the previous scenario with these differences being the response

```json
{
  "metaData": null,
  "data": {
    "articleID": 1,
    "title": "title",
    "content": "content"
  }
}
```

By default, the plugin looks for pk in the response or `ctx.body.id`

We can rewrite these settings for a specific url

config model should change to

```js
{
  model: 'article',
  pk: 'id',
  plugin: null,
  enable: true,
  index: 'article',
  relations: [],
  conditions: {},
  supportAdminPanel: true,
  fillByResponse: true,
  migration: false,
  urls: [
    {
      '/articles':{
        pk: 'data.articleID',  // over write
        relations: [],  // over write
        conditions: {}, // over write
      }
    }
  ],
},
```

### Scenario 4 <a name="scenario-4"></a>

In this scenario, no pk may be found in the request response

```json
{
  "success": true
}
```

In this case, the synchronization operation can be performed on the controller

there is some functions for help

```js
const articleData = { title: 'title', content: 'content' };
const article = await strapi.query('article').create(articleData);

strapi.elastic.createOrUpdate('article', { data: article, id: article.id });
// or
strapi.elastic.migrateById('article', { id: article.id }); // execute new query
```

and for delete data

```js
const articleId = 1;
const article = await strapi.query('article').delete(articleData);

strapi.elastic.destroy('article', { id: articleID });
```

# Functions <a name="functions"></a>

| Command                         | Description                    |           example            |
| :------------------------------ | :----------------------------- | :--------------------------: |
| `strapi.elastic`                | official elasticsearch package |     [example](#elastic)      |
| `strapi.elastic.createOrUpdate` | Create to update data          | [example](#create_or_update) |
| `strapi.elastic.findOne`        | Find specific data by id       |     [example](#findOne)      |
| `strapi.elastic.destroy`        | delete data                    |     [example](#destroy)      |
| `strapi.elastic.migrateById`    | migrate data                   |   [example](#migrateById)    |
| `strapi.elastic.migrateModel`   | migrate specific data          |   [example](#migrateModel)   |
| `strapi.elastic.models`         | migrate all enable models      |      [example](#models)      |
| `strapi.log`                    | log data to elasticsearch      |     [example](#logging)      |

# Api <a name="api"></a>

| Url             | Method | Description               | body                   |
| :-------------- | :----: | :------------------------ | ---------------------- |
| /migrate-models |  POST  | Migrate all enable Models |                        |
| /migrate-Model  |  POST  | Migrate specific model    | `{model:'MODEL_NAME'}` |

# Examples <a name="example"></a>

### elastic

For use official Elasticsearch package we can use `strapi.elastic`, and can access builtin function
[elasticsearch reference api](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html)

```js
const count = strapi.elastic.count({ index: 'article' }); // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_count

const article = strapi.elastic.get({ index: 'article', id: 1 }); // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_get
```

### CreateOrUpdate <a name="create_or_update"></a>

```js
const result = strapi.elastic.createOrUpdate('article', {
  id: 1,
  data: { title: 'title', content: 'content' },
});
```

### findOne <a name="findOne"></a>

```js
const result = strapi.elastic.findOne('article', { id: 1 });
```

### destroy <a name="destroy"></a>

```js
const result_one = strapi.elastic.destroy('article', { id: 1 });
// or
const result_two = strapi.elastic.destroy('article', { id_in: [1, 2, 3] });
```

### migrateById <a name="migrateById"></a>

```js
const result_one = strapi.elastic.migrateById('article', { id: 1 });

const result_two = strapi.elastic.migrateById('article', { id_in: [1, 2, 3] });
```

### migrateModel <a name="migrateModel"></a>

```js
const result = strapi.elastic.migrateModel('article', {
  conditions, // optional
});
```

### migrateModels <a name="migrateModels"></a>

```js
const result = strapi.elastic.migrateModels({
  conditions, // optional (the conditions apply on all models)
});
```

# Logging <a name="logging"></a>

strapi use Pino to logging but can store logs or send it to elasticsearch

at now wen can send logs to elasticsearch by `strapi.elastic.log` there is no difference between `strapi.elastic.log` with `strapi.log` to call functions.

```js
strapi.log.info('log message in console');
strapi.elastic.log.info('log message console and store it to elasticsearch');

strapi.log.debug('log message');
strapi.elastic.log.debug('log message console and store it to elasticsearch');

strapi.log.warn('log message');
strapi.elastic.log.warn('log message console and store it to elasticsearch');

strapi.log.error('log message');
strapi.elastic.log.error('log message console and store it to elasticsearch');

strapi.log.fatal('log message');
strapi.elastic.log.fatal('log message console and store it to elasticsearch');
```

Also there is some more options

```js
// just send log to elastic and avoid to display in console
strapi.elastic.log.info('some message', { setting: { show: false } });

// just display  relations, // optional ni console and avoid to save it to elastic search
strapi.elastic.log.info('some message', { setting: { saveToElastic: false } });

// send more data to elasticsearch
const logData = { description: 'description' };
strapi.elastic.log.info('some message', logData);
```

**By default `strapi.log` send some metaData to elasticsearch such as `free memory`, `cpu load avg`, `current time`, `hostname` ,...**

# Tricks

to avoid config plugin for all model or write a lot of code we can create cron job for migration

```js
const moment = require('moment');
module.exports = {
  '*/10 * * * *': async () => {
    const updateTime = moment()
      .subtract(10, 'minutes')
      .format('YYYY-MM-DD HH:mm:ss');

    // currentTime
    await strapi.elastic.migrateModels({
      conditions: { updated_at_gt: updateTime },
    });
  },
};
```

### ✍️ Authors <a name = ""></a>

- [@marefati110](https://github.com/marefati110)
