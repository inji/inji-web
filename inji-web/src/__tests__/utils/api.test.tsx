import {ApiRequest} from "../../types/data";
import {api as originalApi, MethodType} from '../../utils/api';

type ApiModule = {
  api: typeof originalApi;
  MethodType: typeof MethodType;
};

describe('Testing API Class', () => {
  let apiModule: ApiModule;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, BASE_URL: 'https://example.com' };

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://api.collab.mossip.net'
      },
      writable: true
    });

    Object.defineProperty(window, "_env_", {
        value: {
            MIMOTO_URL: "https://api.collab.mossip.net/v1/mimoto"
        },
        writable: true
    });

    jest.resetModules();
    apiModule = require('../../utils/api') as ApiModule;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('Check mimotoHost property', () => {
    expect(apiModule.api.mimotoHost).toBe('https://api.collab.mossip.net/v1/mimoto');
  });

  test('Check authorizationRedirectionUrl property', () => {
    expect(apiModule.api.authorizationRedirectionUrl).toBe('https://api.collab.mossip.net/redirect');
  });

  test('Check fetchIssuers request', () => {
    const fetchIssuers: ApiRequest = apiModule.api.fetchIssuers;
    expect(fetchIssuers.url()).toBe('https://api.collab.mossip.net/v1/mimoto/v2/issuers');
    expect(fetchIssuers.methodType).toBe(apiModule.MethodType.GET);
    expect(fetchIssuers.headers()).toEqual({
      'Content-Type': 'application/json'
    });
  });

  test('Check fetchSpecificIssuer request', () => {
    const issuerId = '123';
    const fetchSpecificIssuer: ApiRequest = apiModule.api.fetchSpecificIssuer;
    expect(fetchSpecificIssuer.url(issuerId)).toBe('https://api.collab.mossip.net/v1/mimoto/v2/issuers/123');
    expect(fetchSpecificIssuer.methodType).toBe(apiModule.MethodType.GET);
    expect(fetchSpecificIssuer.headers()).toEqual({
      'Content-Type': 'application/json'
    });
  });

  test('Check fetchIssuersWellknown request', () => {
    const issuerId = '123';
    const fetchIssuersConfig: ApiRequest = apiModule.api.fetchIssuersConfiguration;
    expect(fetchIssuersConfig.url(issuerId)).toBe('https://api.collab.mossip.net/v1/mimoto/issuers/123/configuration');
    expect(fetchIssuersConfig.methodType).toBe(apiModule.MethodType.GET);
    expect(fetchIssuersConfig.headers()).toEqual({
      'Content-Type': 'application/json'
    });
  });

  test('Check fetchTokenAnddownloadVc request', () => {
    const fetchTokenAnddownloadVc: ApiRequest = apiModule.api.fetchTokenAnddownloadVc;
    expect(fetchTokenAnddownloadVc.url()).toBe('https://api.collab.mossip.net/v1/mimoto/credentials/download');
    expect(fetchTokenAnddownloadVc.methodType).toBe(apiModule.MethodType.POST);
    expect(fetchTokenAnddownloadVc.credentials).toBe('include');
    expect(fetchTokenAnddownloadVc.headers()).toEqual({
      'accept': 'application/pdf',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
  });

  test('Check authorizeIssuance request', () => {
    const authorizeIssuance = apiModule.api.authorizeIssuance;
    expect(authorizeIssuance.url('issuer123')).toBe(
      'https://api.collab.mossip.net/v1/mimoto/issuers/issuer123/authorize'
    );
    expect(authorizeIssuance.methodType).toBe(apiModule.MethodType.POST);
    expect(authorizeIssuance.credentials).toBe('include');
    expect(authorizeIssuance.headers()).toEqual({
      'Content-Type': 'application/json'
    });
  });
});