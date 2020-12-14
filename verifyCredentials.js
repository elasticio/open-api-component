const { OpenApiClient } = require('./lib/openApiClient');

module.exports = async function verify(credentials) {
  this.logger.info('Starting credentials verification');
  const openApiClient = new OpenApiClient(this, credentials);
  await openApiClient.init();
  this.logger.info('Verification completed successfully');
  return true;
};
