import { useMemo } from 'react';
import { get, isEqual } from 'lodash';

import type { JSONSchema4WithUiDefinition } from '@/core/react-query/configuration/types';

export function getVisibility(
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  modes: { advanced: boolean, debug: boolean },
  loadedEnvironmentVariables: string[],
): 'visible' | 'hidden' | 'read-only' | 'disabled' {
  const uiDefinition = schema['x-uiDefinition'];
  const visibility = uiDefinition?.visibility ?? { default: 'visible', advanced: false };
  if (!modes.advanced && visibility.advanced) {
    return 'hidden';
  }
  let type = visibility.default;
  if (visibility.toggle) {
    const value = get(config, visibility.toggle.path.split('.')) as unknown;
    let isToggled = isEqual(value, visibility.toggle.value);
    if (visibility.toggle.inverseCondition) {
      isToggled = !isToggled;
    }
    type = isToggled ? visibility.toggle.visibility : visibility.default;
  }
  if (type !== 'visible') {
    return type;
  }
  if (uiDefinition?.envVar) {
    const { envVar, envVarOverridable } = uiDefinition;
    const isLoaded = loadedEnvironmentVariables.includes(envVar);
    if (isLoaded && !envVarOverridable) {
      return 'read-only';
    }
  }

  if (visibility.disableToggle) {
    const value = get(config, visibility.disableToggle.path.split('.')) as unknown;
    let isToggled = isEqual(value, visibility.disableToggle.value);
    if (visibility.disableToggle.inverseCondition) {
      isToggled = !isToggled;
    }
    if (isToggled) return 'disabled';
  }
  return 'visible';
}

function useVisibility(
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  modes: { advanced: boolean, debug: boolean },
  loadedEnvironmentVariables: string[],
): 'visible' | 'hidden' | 'read-only' | 'disabled' {
  return useMemo(() => getVisibility(schema, config, modes, loadedEnvironmentVariables), [
    schema,
    config,
    modes,
    loadedEnvironmentVariables,
  ]);
}

export default useVisibility;
