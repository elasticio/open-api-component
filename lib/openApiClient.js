const Swagger = require('swagger-client');
const { getSecurities } = require('./utils');

class OpenApiClient {
  constructor(context, cfg) {
    if (!cfg.openApiUrl) {
      throw new Error('openApiUrl is required');
    }
    this.cfg = cfg;
    this.logger = context.logger;
    this.emitter = context;
  }

  async init() {
    const { openApiUrl } = this.cfg;
    this.client = await Swagger({ url: openApiUrl });
  }

  getSpec() {
    return this.client.spec;
  }

  getOperationsByPath() {
    const { path } = this.cfg;
    return this.client.spec.paths[path];
  }

  getParametersByOperation() {
    const operations = this.getOperationsByPath();
    const operationObject = operations[this.cfg.operation];
    const { parameters } = operationObject;
    return parameters;
  }

  async requestApis(tag, operationId, body) {
    this.securities = await getSecurities(this.cfg, this.client.spec, this.logger, this.emitter);
    return this.client.apis[tag][operationId](body, {
      securities: this.securities,
    });
  }
}
module.exports.OpenApiClient = OpenApiClient;
