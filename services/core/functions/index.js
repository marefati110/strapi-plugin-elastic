const { createOrUpdate } = require('./CreateOrUpdate');
const { findOne } = require('./findOne');
const { find } = require('./find');
const { destroy } = require('./Delete');

module.exports = { createOrUpdate, findOne, find, destroy };
