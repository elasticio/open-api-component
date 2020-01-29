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
  const inputMetadata = {
    type: 'object',
    properties: {},
  };
  const openApiClient = new OpenApiClient(cfg, this.logger);
  await openApiClient.init();
  const operations = openApiClient.getOperationsByPath();
  const { operation } = cfg;
  const operationObject = operations[operation];
  const paramsArray = operationObject.parameters;
  if (paramsArray && paramsArray.length !== 0) {
    const pathParamsArray = paramsArray.filter((item) => item.in === 'path');
    const requestBody = paramsArray.filter((item) => item.in !== 'path');
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
  const { path, operation, dontThrowErrorFlg } = cfg;
  const operations = spec.paths[path];
  const operetionObject = operations[operation];
  const { operationId, tags } = operetionObject;
  const tag = tags[0];
  let response;
  try {
    response = await openApiClient.requestApis(tag, operationId, msg.body);
  } catch (e) {
    response = e.response;
    const { status } = response;
    if ((!status) || (!dontThrowErrorFlg && status >= 400)) {
      this.logger.error(`${e.message || 'HTTP error.'}`);
      throw new Error(e);
    }
  }
  const { headers, body, status } = response;
  const result = { headers, body, responseCode: status };
  await this.emit('data', messages.newMessageWithBody(result));
}

module.exports.getPath = getPath;
module.exports.getOperations = getOperations;
module.exports.getMetaModel = getMetaModel;
module.exports.process = process;
