const { messages } = require('elasticio-node');
const { getViewClassModel, getInputMetadata, getOutputMetadata } = require('../utils');
const { OpenApiClient } = require('../openApiClient');

async function getPath(cfg) {
  const openApiClient = new OpenApiClient(this, cfg);
  await openApiClient.init();
  const spec = openApiClient.getSpec();
  const pathsArray = spec.paths;
  return getViewClassModel(pathsArray);
}

async function getOperations(cfg) {
  const openApiClient = new OpenApiClient(this, cfg);
  await openApiClient.init();
  const operations = openApiClient.getOperationsByPath();
  return getViewClassModel(operations);
}

async function getMetaModel(cfg) {
  const openApiClient = new OpenApiClient(this, cfg);
  await openApiClient.init();
  const parameters = openApiClient.getParametersByOperation();
  const inputMetadata = getInputMetadata(parameters);
  const outputMetadata = getOutputMetadata();
  return {
    in: inputMetadata,
    out: outputMetadata,
  };
}

async function process(msg, cfg) {
  this.logger.trace('Cfg %j', cfg);
  this.logger.trace('Msg', msg);
  const openApiClient = new OpenApiClient(this, cfg);
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
