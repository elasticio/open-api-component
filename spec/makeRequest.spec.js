const { expect } = require('chai');
const logger = require('@elastic.io/component-logger')();

const action = require('../lib/actions/makeRequest');

const cfg = {
  openApiUrl: 'https://petstore.swagger.io/v2/swagger.json',
};

describe('parse openapi document test', () => {
  it('getPath test', async () => {
    const result = await action.getPath.call({ logger }, cfg);
    expect(result).to.have.ownPropertyDescriptor('/pet');
  });

  it('getOperations test', async () => {
    cfg.path = '/pet';
    const result = await action.getOperations.call({ logger }, cfg);
    expect(result).to.have.ownPropertyDescriptor('post');
  });
});
