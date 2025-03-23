import React, { useMemo } from 'react';

import CustomBadge from '@/components/Configuration/Badges/CustomBadge';
import EnvironmentVariableBadge from '@/components/Configuration/Badges/EnvironmentVariableBadge';
import NeedsRestartBadge from '@/components/Configuration/Badges/NeedsRestartBadge';

import type { JSONSchema4WithUiDefinition } from '@/core/react-query/configuration/types';

function useBadges(
  schema: JSONSchema4WithUiDefinition,
  path: (string | number)[],
  loadedEnvironmentVariables: string[],
  restartPendingFor: string[],
): React.JSX.Element | null {
  return useMemo(() => {
    const uiDefinition = schema['x-uiDefinition'];
    if (!uiDefinition) {
      return null;
    }

    const badge = uiDefinition.badge
      ? <CustomBadge name={uiDefinition.badge.name} theme={uiDefinition.badge.theme} />
      : null;
    const envVar = uiDefinition.envVar
      ? (
        <EnvironmentVariableBadge
          envVar={uiDefinition.envVar}
          envVarOverridable={uiDefinition.envVarOverridable}
          loadedEnvironmentVariables={loadedEnvironmentVariables}
        />
      )
      : null;
    const needsRestart = uiDefinition.requiresRestart
      ? <NeedsRestartBadge path={path} restartPendingFor={restartPendingFor} />
      : null;
    return (
      <>
        {badge}
        {envVar}
        {needsRestart}
      </>
    );
  }, [schema, path, loadedEnvironmentVariables, restartPendingFor]);
}

export default useBadges;
