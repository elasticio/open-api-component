function getSecurities(cfg, spec, logger) {
  if (!cfg.auth || cfg.auth.type === 'No Auth') {
    logger.info('It is defined \'No Auth\' type');
    return {};
  }
  const { type } = cfg.auth;
  logger.info(`Authentication type: ${type} is defined`);
  if (type === 'Basic Auth') {
    const { username, password } = cfg.auth.basic;
    if (!username) {
      logger.error('Error: Username is required for basic auth');
      throw new Error('Username is required for basic auth');
    }

    if (!password) {
      logger.error('Error: Password is required for basic auth');
      throw new Error('Password is required for basic auth');
    }
    return {
      authorized: {
        basicAuth: { value: { username, password } },
      },
    };
  }
  if (type === 'API Key Auth') {
    const { headerName, headerValue } = cfg.auth.apiKey;
    logger.trace(`Found headerName: ${headerName} and headerValue: ${headerValue}`);
    if (!headerName) {
      logger.error('Error: headerName is required for API Key Auth');
      throw new Error('headerName is required for API Key Auth');
    }
    if (!headerValue) {
      logger.error('Error: headerValue is required for API Key Auth');
      throw new Error('headerValue is required for API Key Auth');
    }
    const { securityDefinitions } = spec;
    logger.trace('Found securityDefinitions: %j', securityDefinitions);
    const apiKeyHeaderName = Object.keys(securityDefinitions).filter(
      (key) => securityDefinitions[key].type === 'apiKey'
          && securityDefinitions[key].name === headerName
          && securityDefinitions[key].in === 'header',
    );
    if (!apiKeyHeaderName) {
      logger.error(`Error: can't find securityDefinitions for header: ${headerName}`);
      throw new Error('securityDefinitions is required for API Key Auth type');
    }
    const authorized = {};
    authorized[apiKeyHeaderName] = {
      value: headerValue,
    };
    return { authorized };
  }
  throw new Error(`Auth Type ${type} not yet implemented.`);
}

function getViewClassModel(modelArray) {
  const arrayKeys = Object.keys(modelArray);
  const result = {};
  arrayKeys.forEach((path) => { result[path] = path; });
  return result;
}
module.exports.getSecurities = getSecurities;
module.exports.getViewClassModel = getViewClassModel;
