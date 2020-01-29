const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const makeRequest = require('../lib/actions/makeRequest');

const cfg = {
  openApiUrl: 'https://petstore.swagger.io/v2/swagger.json',
};
const self = {
  logger,
};

describe('makeRequest action test', () => {
  describe('getPath test', () => {
    it('getPath should succeed', async () => {
      const result = await makeRequest.getPath.call(self, cfg);
      expect(result).to.have.ownPropertyDescriptor('/pet');
    });
  });

  describe('getOperations test', () => {
    it('getOperations should succeed', async () => {
      cfg.path = '/pet';
      const result = await makeRequest.getOperations.call(self, cfg);
      expect(result).to.have.ownPropertyDescriptor('post');
    });
  });

  describe('getMetaModel test', () => {
    it('getMetaModel should succeed', async () => {
      cfg.path = '/pet/{petId}';
      cfg.operation = 'post';
      const result = await makeRequest.getMetaModel.call(self, cfg);
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
  });

  describe('makeRequest action process test', () => {
    beforeEach(() => {
      self.emit = sinon.spy();
    });
    afterEach(() => {
      sinon.restore();
    });
    it('process test', async () => {
      cfg.path = '/pet/{petId}';
      cfg.operation = 'get';
      const msg = {
        body: {
          petId: 3,
        },
      };
      await makeRequest.process.call(self, msg, cfg);
      expect(self.emit.calledOnce).to.equal(true);
    });

    it('process test with dontThrowErrorFlg', async () => {
      cfg.path = '/pet/{petId}';
      cfg.operation = 'get';
      cfg.dontThrowErrorFlg = true;
      const msg = {
        body: {
          petId: 'eeee',
        },
      };
      await makeRequest.process.call(self, msg, cfg);
      expect(self.emit.calledOnce).to.equal(true);
      expect(self.emit.firstCall.args[0]).to.equal('data');
      expect(self.emit.firstCall.args[1].body.responseCode).to.equal(404);
    });
  });
});
