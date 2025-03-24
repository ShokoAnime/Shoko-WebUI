import { useMemo } from 'react';
import { get, isEqual } from 'lodash';

import type { JSONSchema4WithUiDefinition } from '@/core/react-query/configuration/types';

export function getVisibility(
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  advancedMode: boolean,
  loadedEnvironmentVariables: string[],
): 'visible' | 'hidden' | 'read-only' | 'disabled' {
  const uiDefinition = schema['x-uiDefinition'];
  const visibility = uiDefinition?.visibility ?? { default: 'visible', advanced: false };
  if (!advancedMode && visibility.advanced) {
    return 'hidden';
  }
  let type = visibility.default;
  if (visibility.toggle) {
    const value = get(config, visibility.toggle.path.split('.')) as unknown;
    const isToggled = isEqual(value, visibility.toggle.value);
    type = isToggled ? visibility.toggle.visibility : visibility.default;
  }
  if (type === 'visible' && uiDefinition?.envVar) {
    const { envVar, envVarOverridable } = uiDefinition;
    const isLoaded = loadedEnvironmentVariables.includes(envVar);
    if (isLoaded && !envVarOverridable) {
      return 'read-only';
    }
  }
  return type;
}

function useVisibility(
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  advancedMode: boolean,
  loadedEnvironmentVariables: string[],
): 'visible' | 'hidden' | 'read-only' | 'disabled' {
  return useMemo(() => getVisibility(schema, config, advancedMode, loadedEnvironmentVariables), [
    schema,
    config,
    advancedMode,
    loadedEnvironmentVariables,
  ]);
}

export default useVisibility;
