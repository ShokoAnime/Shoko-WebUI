import { useMemo } from 'react';
import semver from 'semver';

import queryClient from '@/core/react-query/queryClient';
import { parseServerVersion } from '@/core/util';

import type { VersionType } from '@/core/types/api/init';

enum FeatureType {
  UnairedEpisodeFilter = '5.0.0-dev.18',
}

const useIsFeatureSupported = (feature: FeatureType) => {
  const version = queryClient.getQueryData<VersionType>(['init', 'version'])?.Server.Version ?? '1.0.0.0';
  const parsedVersion = parseServerVersion(version);

  return useMemo(() => {
    if (!parsedVersion) return false;
    return semver.gte(parsedVersion, feature);
  }, [feature, parsedVersion]);
};

export default useIsFeatureSupported;
