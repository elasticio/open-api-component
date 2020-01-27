const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const action = require('../lib/actions/makeRequest');

const cfg = {
  openApiUrl: 'https://petstore.swagger.io/v2/swagger.json',
};
const self = {
  emit: sinon.spy(),
  logger,
};

describe('Get Pets By Status', () => {
  it('getPath test', async () => {
    const result = await action.getPath.call(self, cfg);
    expect(result).to.have.ownPropertyDescriptor('/pet');
  });
  it('getOperations test', async () => {
    cfg.path = '/pet';
    const result = await action.getOperations.call(self, cfg);
    expect(result).to.have.ownPropertyDescriptor('post');
  });

  it('getMetaModel test', async () => {
    cfg.path = '/pet/{petId}';
    cfg.operation = 'post';
    const result = await action.getMetaModel.call(self, cfg);
    expect(result.in).to.deep.equal({
      type: 'object',
      properties: {
        petId: {
          type: 'integer',
          required: true,
        },
        body: {
          type: 'object',
          properties: {},
        },
      },
    });
  });
  it('process test', async () => {
    cfg.path = '/pet/{petId}';
    cfg.operation = 'get';
    const msg = {
      body: {
        petId: 3,
      },
    };
    await action.process.call(self, msg, cfg);
    // eslint-disable-next-line no-unused-expressions
    expect(self.emit.calledOnce).to.be.true;
  });
});
