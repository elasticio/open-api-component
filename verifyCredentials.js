const { OpenApiClient } = require('./lib/openApiClient');

module.exports = async function verify(credentials) {
  this.logger.debug('credentials:', JSON.stringify(credentials));
  const openApiClient = new OpenApiClient(this, credentials);
  await openApiClient.init();
  return true;
};
