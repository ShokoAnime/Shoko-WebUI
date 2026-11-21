import { describe, expect, it } from 'vitest';

import { getLoginMethodHref, getLoginMethods } from '@/core/utilities/loginMethods';

import type { PluginFeatureType } from '@/core/types/api/plugin';

const feature = (overrides: Partial<PluginFeatureType> = {}): PluginFeatureType => ({
  PluginID: 'p1',
  Name: 'login-method',
  Version: '1.0.0',
  Visibility: 'Anonymous',
  Metadata: { displayName: 'Authentik', loginUrl: '/api/plugin/Oidc/login' },
  ...overrides,
});

describe('getLoginMethods', () => {
  it('returns a valid anonymous login method', () => {
    expect(getLoginMethods([feature()])).toEqual([
      { pluginId: 'p1', displayName: 'Authentik', loginUrl: '/api/plugin/Oidc/login' },
    ]);
  });

  it('ignores other features and non-anonymous ones', () => {
    expect(getLoginMethods([feature({ Name: 'something-else' }), feature({ Visibility: 'Admin' })])).toEqual([]);
  });

  it.each([
    'https://evil.example/login',
    '//evil.example/login',
    '/\\evil.example',
    ['java', 'script:alert(1)'].join(''),
    '',
  ])('refuses a login url that leaves the server: %s', (loginUrl) => {
    expect(getLoginMethods([feature({ Metadata: { displayName: 'X', loginUrl } })])).toEqual([]);
  });

  it('refuses a missing name or missing metadata', () => {
    expect(getLoginMethods([feature({ Metadata: null }), feature({ Metadata: { loginUrl: '/a' } })])).toEqual([]);
  });

  it('copes with no features', () => {
    expect(getLoginMethods(undefined)).toEqual([]);
  });
});

describe('getLoginMethodHref', () => {
  const method = { pluginId: 'p1', displayName: 'X', loginUrl: '/api/plugin/Oidc/login' };

  it('passes a local redirect as returnUrl', () => {
    expect(getLoginMethodHref(method, '/webui/collection')).toBe(
      '/api/plugin/Oidc/login?returnUrl=%2Fwebui%2Fcollection',
    );
  });

  it('drops a redirect that is not a local path', () => {
    expect(getLoginMethodHref(method, '//evil.example')).toBe('/api/plugin/Oidc/login');
    expect(getLoginMethodHref(method, null)).toBe('/api/plugin/Oidc/login');
  });

  it('keeps an existing query string', () => {
    expect(getLoginMethodHref({ ...method, loginUrl: '/login?x=1' }, '/webui')).toBe('/login?x=1&returnUrl=%2Fwebui');
  });
});
