const { expect } = require('chai');
const logger = require('@elastic.io/component-logger')();
const { getSecurities, getViewClassModel, getInputMetadata } = require('../lib/utils');

describe('utils test', () => {
  describe('getSecurities test', () => {
    describe('type No Auth test', () => {
      it('type No Auth should succeed', async () => {
        const cfg = {
          auth: {
            type: 'No Auth',
          },
        };
        const result = getSecurities(cfg, {}, logger);
        expect(result).to.deep.equals({});
      });

      it('empty type should succeed', async () => {
        const result = getSecurities({}, {}, logger);
        expect(result).to.deep.equals({});
      });
    });

    describe('type Basic Auth test', () => {
      it('type Basic Auth should succeed', async () => {
        const cfg = {
          auth: {
            type: 'Basic Auth',
            basic: {
              username: 'username',
              password: 'password',
            },
          },
        };
        const result = getSecurities(cfg, {}, logger);
        expect(result).to.deep.equals({
          authorized: {
            basicAuth: {
              value: {
                password: 'password',
                username: 'username',
              },
            },
          },
        });
      });

      it('type Basic Auth should fail without password', async () => {
        const cfg = {
          auth: {
            type: 'Basic Auth',
            basic: {
              username: 'username',
            },
          },
        };
        expect(() => getSecurities(cfg, {}, logger)).to.throw('Password is required for basic auth');
      });
    });

    describe('type API Key Auth test', () => {
      const cfg = {
        auth: {
          type: 'API Key Auth',
          apiKey: {
            headerName: 'headerName',
            headerValue: 'headerValue',
          },
        },
      };
      it('type API Key Auth should succeed', async () => {
        const spec = {
          securityDefinitions: {
            api_key: {
              type: 'apiKey',
              in: 'header',
              name: 'headerName',
            },
          },
        };
        const result = getSecurities(cfg, spec, logger);
        expect(result).to.deep.equals({
          authorized: {
            api_key: {
              value: 'headerValue',
            },
          },
        });
      });

      it('type API Key Auth should fail without securityDefinitions', async () => {
        const spec = {
          securityDefinitions: {
            api_key: {
              type: 'apiKey',
              in: 'query',
              name: 'headerName',
            },
          },
        };
        expect(() => getSecurities(cfg, spec, logger)).to.throw('securityDefinitions for Api Key in header is required for API Key Auth type');
      });
    });

    describe('unsupported Auth type test', () => {
      const cfg = {
        auth: {
          type: 'Fail Auth',
        },
      };

      it('should fail for unsupported Auth type', async () => {
        expect(() => getSecurities(cfg, {}, logger)).to.throw('Auth Type Fail Auth not yet implemented.');
      });
    });
  });

  describe('getViewClassModel test', () => {
    it('should succeed', async () => {
      const testData = { user: { id: 1 }, pet: { petId: 8 } };
      const result = getViewClassModel(testData);
      expect(result).to.deep.equal({
        pet: 'pet',
        user: 'user',
      });
    });
  });

  describe('getInputMetadata test', () => {
    it('should returned petId and body', async () => {
      const testData = [
        {
          name: 'petId',
          in: 'path',
          required: true,
          type: 'integer',
        },
        {
          name: 'name',
          in: 'formData',
          required: false,
          type: 'string',
        },
      ];
      const result = getInputMetadata(testData);
      expect(result).to.deep.equal({
        type: 'object',
        properties: {
          body: {
            properties: {},
            type: 'object',
          },
          petId: {
            required: true,
            type: 'integer',
          },
        },
      });
    });
    it('should returned only path params', async () => {
      const testData = [
        {
          name: 'petId',
          in: 'path',
          required: true,
          type: 'integer',
        },
      ];
      const result = getInputMetadata(testData);
      expect(result).to.deep.equal({
        type: 'object',
        properties: {
          petId: {
            required: true,
            type: 'integer',
          },
        },
      });
    });
  });
});