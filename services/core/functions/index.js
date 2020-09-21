const { createOrUpdate } = require('./CreateOrUpdate');
const { findOne } = require('./findOne');
const { destroy } = require('./Delete');

module.exports = { createOrUpdate, findOne, destroy };
