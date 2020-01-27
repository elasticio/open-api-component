/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const logger = require('@elastic.io/component-logger')();
const verify = require('../verifyCredentials');

describe('VerifyCredentials works as intended', () => {
  it('Works for success', async () => {
    const cfg = {
      openApiUrl: 'https://petstore.swagger.io/v2/swagger.json',
      auth: {
        type: 'Basic Auth',
        basic: {
          username: 'test',
          password: 'test',
        },
      },
    };
    const result = await verify.call({ logger }, cfg);
    expect(result).to.be.true;
  });

  it('Works for failure', async () => {
    const cfg = {
      openApiUrl: 'https://petstore.swagger.io/v2/swagger.json',
      auth: {
        type: 'Basic Auth',
        basic: {
          username: 'test',
        },
      },
    };
    verify.call({ logger }, cfg)
      .then(() => { throw new Error('Test should be failed'); })
      .catch((error) => expect(error.message).to.equal('Password is required for basic auth'));
  });
});
