const request = require('request-promise');

async function fetchNewToken(oauth2, logger) {
  logger.debug('Fetching new token...');
  const params = {
    uri: oauth2.tokenUri,
    method: 'POST',
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    form: {
      refresh_token: oauth2.keys.refresh_token,
      scope: oauth2.scope,
      grant_type: 'refresh_token',
      client_id: oauth2.clientId,
      client_secret: oauth2.clientSecret,
    },
  };
  const authTokenResponse = await request(params);

  logger.debug('New token fetched');
  if (authTokenResponse.statusCode >= 400) {
    throw new Error(`Error in authentication.  Status code: ${authTokenResponse.statusCode}, Body: ${JSON.stringify(authTokenResponse.body)}`);
  }
  return authTokenResponse.body;
}

async function getValidToken(cfg, logger, emitter) {
  const { oauth2 } = cfg.auth;
  if (!oauth2) {
    throw new Error('cfg.oauth2 can not be empty');
  }
  const { keys } = oauth2;
  if (!keys) {
    throw new Error('cfg.auth.oauth2.keys can not be empty');
  }

  const tokenExpiryTime = new Date(keys.tokenExpiryTime);
  const now = new Date();
  if (now < tokenExpiryTime) {
    logger.debug('Previously valid token found.');
    return keys.access_token;
  }

  const tokenRefreshStartTime = new Date();
  oauth2.keys = await fetchNewToken(oauth2, logger);
  oauth2.keys.tokenExpiryTime = (new Date(tokenRefreshStartTime.getTime()
      + (oauth2.keys.expires_in * 1000))).toISOString();
  emitter.emit('updateKeys', { auth: cfg.auth });
  return oauth2.keys.access_token;
}

async function getSecurities(cfg, spec, logger, emitter) {
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
    logger.trace('Found headerName and headerValue');
    if (!headerName) {
      logger.error('Error: headerName is required for API Key Auth');
      throw new Error('headerName is required for API Key Auth');
    }
    if (!headerValue) {
      logger.error('Error: headerValue is required for API Key Auth');
      throw new Error('headerValue is required for API Key Auth');
    }
    const { securityDefinitions } = spec;
    logger.debug('Found securityDefinitions');
    const apiKeyHeaderName = Object.keys(securityDefinitions).filter(
      (key) => securityDefinitions[key].type === 'apiKey'
          && securityDefinitions[key].name === headerName
          && securityDefinitions[key].in === 'header',
    );
    if (apiKeyHeaderName.length === 0) {
      logger.error('Error: can\'t find securityDefinitions for specified Api Key header');
      throw new Error('securityDefinitions for Api Key in header is required for API Key Auth type');
    }
    const authorized = {};
    authorized[apiKeyHeaderName] = {
      value: headerValue,
    };
    return { authorized };
  }
  if (type === 'OAuth2') {
    const { securityDefinitions } = spec;
    logger.debug('Found securityDefinitions');
    const oauth2SecurityName = Object.keys(securityDefinitions).filter((key) => securityDefinitions[key].type === 'oauth2');
    if (oauth2SecurityName.length !== 1) {
      logger.error('One OAuth2 security definitions should be defined');
      throw new Error('One OAuth2 security definitions should be defined for OAuth2 type');
    }
    const accessToken = await getValidToken(cfg, logger, emitter);
    const authorized = {};
    authorized[oauth2SecurityName] = { token: { access_token: accessToken } };
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

function getOutputMetadata() {
  return {
    type: 'object',
    properties: {
      headers: {
        type: 'object',
        properties: {},
        required: true,
      },
      body: {
        type: 'object',
        properties: {},
        required: true,
      },
      responseCode: {
        type: 'number',
        required: true,
      },
    },
  };
}

function getInputMetadata(paramsArray) {
  const inputMetadata = {
    type: 'object',
    properties: {},
  };
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
  return inputMetadata;
}

module.exports.getOutputMetadata = getOutputMetadata;
module.exports.getInputMetadata = getInputMetadata;
module.exports.getSecurities = getSecurities;
module.exports.getViewClassModel = getViewClassModel;
