const { OpenApiClient } = require('./lib/openApiClient');

module.exports = async function verify(credentials) {
  this.logger.debug('credentials:', JSON.stringify(credentials));
  const openApiClient = new OpenApiClient(credentials, this.logger);
  await openApiClient.init();
  return true;
};
