import type { PluginFeatureType } from '@/core/types/api/plugin';

export const LoginMethodFeature = 'login-method';

export type LoginMethodType = {
  pluginId: string;
  displayName: string;
  loginUrl: string;
};

// The URL comes from plugin metadata, so only a path on this server is followed.
const isLocalPath = (url: string) => url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');

export const getLoginMethods = (features: PluginFeatureType[] | undefined): LoginMethodType[] =>
  (features ?? []).flatMap((feature) => {
    if (feature.Name !== LoginMethodFeature || feature.Visibility !== 'Anonymous') return [];

    const { displayName, loginUrl } = feature.Metadata ?? {};
    if (typeof displayName !== 'string' || displayName === '') return [];
    if (typeof loginUrl !== 'string' || !isLocalPath(loginUrl)) return [];

    return [{ pluginId: feature.PluginID, displayName, loginUrl }];
  });

export const getLoginMethodHref = (method: LoginMethodType, redirectTo: string | null) => {
  const [path, query = ''] = method.loginUrl.split('?');
  const params = new URLSearchParams(query);
  if (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) params.set('returnUrl', redirectTo);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};
