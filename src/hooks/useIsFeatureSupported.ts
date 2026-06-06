import { useMemo } from 'react';
import semver from 'semver';

import queryClient from '@/core/react-query/queryClient';

import type { VersionType } from '@/core/types/api/init';

export enum FeatureType {
  Placeholder = '5.0.0-dev.1', // This is as a placeholder so the string conversion for `parseServerVersion` works and also serves as an example
}

const useIsFeatureSupported = (supportedVersion: FeatureType) => {
  const version = queryClient.getQueryData<VersionType>(['init', 'version'])?.Server.Version ?? '1.0.0-dev.1';

  return useMemo(() => {
    if (!version || !supportedVersion) return false;
    return semver.gte(version, supportedVersion);
  }, [supportedVersion, version]);
};

export default useIsFeatureSupported;
