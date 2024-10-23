import { useMemo } from 'react';
import semver from 'semver';

import queryClient from '@/core/react-query/queryClient';
import { parseServerVersion } from '@/core/util';

import type { VersionType } from '@/core/types/api/init';

export enum FeatureType {
  UnairedEpisodeFilter = '5.0.0.18',
}

const useIsFeatureSupported = (feature: FeatureType) => {
  const version = queryClient.getQueryData<VersionType>(['init', 'version'])?.Server.Version ?? '1.0.0.0';

  return useMemo(() => {
    const parsedVersion = parseServerVersion(version);
    const parsedFeatureMinVersion = parseServerVersion(feature);

    if (!parsedVersion || !parsedFeatureMinVersion) return false;
    return semver.gte(parsedVersion, parsedFeatureMinVersion);
  }, [feature, version]);
};

export default useIsFeatureSupported;
