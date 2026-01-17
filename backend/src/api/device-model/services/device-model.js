'use strict';

/**
 * device-model service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::device-model.device-model');
