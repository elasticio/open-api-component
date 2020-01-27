const { messages } = require('elasticio-node');
const { getViewClassModel } = require('../utils');
const { OpenApiClient } = require('../openApiClient');

async function getPath(cfg) {
  const openApiClient = new OpenApiClient(cfg, this.logger);
  await openApiClient.init();
  const spec = openApiClient.getSpec();
  const pathsArray = spec.paths;
  return getViewClassModel(pathsArray);
}

async function getOperations(cfg) {
  const openApiClient = new OpenApiClient(cfg, this.logger);
  await openApiClient.init();
  const operations = openApiClient.getOperationsByPath();
  return getViewClassModel(operations);
}

async function getMetaModel(cfg) {
  const openApiClient = new OpenApiClient(cfg, this.logger);
  await openApiClient.init();
  const operations = openApiClient.getOperationsByPath();
  const { operation } = cfg;
  const operationObject = operations[operation];
  const paramsArray = operationObject.parameters;
  const pathParamsArray = paramsArray.filter((item) => item.in === 'path');
  const requestBody = paramsArray.filter((item) => item.in !== 'path');
  const inputMetadata = {
    type: 'object',
    properties: {},
  };
  if (pathParamsArray.length !== 0) {
    const params = {};
    pathParamsArray.forEach((param) => {
      params[param.name] = {
        type: param.type,
        required: param.required,
      };
    });
    inputMetadata.properties = params;
  }
  if (requestBody.length !== 0) {
    inputMetadata.properties.body = {
      type: 'object',
      properties: {},
    };
  }
  return {
    in: inputMetadata,
    out: {},
  };
}

async function process(msg, cfg) {
  this.logger.trace('Cfg %j', cfg);
  this.logger.trace('Msg', msg);
  const openApiClient = new OpenApiClient(cfg, this.logger);
  await openApiClient.init();
  const spec = openApiClient.getSpec();
  const { path, operation } = cfg;
  const { body } = msg;
  const operations = spec.paths[path];
  const operetionObject = operations[operation];
  const { operationId, tags } = operetionObject;
  const tag = tags[0];
  const result = openApiClient.requestApis(tag, operationId, body);
  await this.emit('data', messages.newMessageWithBody(result.body));
}

module.exports.getPath = getPath;
module.exports.getOperations = getOperations;
module.exports.getMetaModel = getMetaModel;
module.exports.process = process;
