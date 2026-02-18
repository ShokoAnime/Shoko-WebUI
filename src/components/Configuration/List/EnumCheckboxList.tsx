import React, { useMemo, useState } from 'react';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import DnDList from '@/components/DnDList/DnDList';
import Checkbox from '@/components/Input/Checkbox';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type {
  EnumConfigurationUiDefinitionType,
  SimpleListConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';
import type { DropResult } from '@hello-pangea/dnd';

let idCount = 0;

function EnumCheckboxList(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  // eslint-disable-next-line no-plusplus
  const prefix = useMemo(() => `list-${idCount++}-`, []);
  const uiDefinition = resolvedSchema['x-uiDefinition'] as
    & Omit<EnumConfigurationUiDefinitionType, 'elementType'>
    & SimpleListConfigurationUiDefinitionType;
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1]?.toString()
    ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const values = props.config as string[];
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const isSortable = visibility === 'visible' && uiDefinition.listSortable;
  const [definitions, setOrder] = useState(() => {
    const defList = uiDefinition.deniedValues
      ? uiDefinition.enumDefinitions.filter(definition => !uiDefinition.deniedValues!.includes(definition.value))
      : uiDefinition.enumDefinitions;
    if (!uiDefinition.listSortable) {
      return defList;
    }

    const order = Array.from(new Set([...values, ...defList.map(def => def.value)]));
    return defList.sort((defA, defB) => order.indexOf(defA.value) - order.indexOf(defB.value));
  });

  const onDragEnd = useEventCallback((result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const newDefinitions = [...definitions];
    const [removed] = newDefinitions.splice(result.source.index, 1);
    newDefinitions.splice(result.destination.index, 0, removed);
    const newValues = newDefinitions.map(def => def.value).filter(value => values.includes(value));
    setOrder(newDefinitions);
    props.updateField(props.path, newValues, props.schema, props.rootSchema);
  });

  const addValue = useEventCallback((value: string) => {
    if (values.includes(value)) {
      return;
    }
    const newValues = [...values, value];
    const orderedValues = definitions.map(def => def.value).filter(val => newValues.includes(val));
    props.updateField(props.path, orderedValues, props.schema, props.rootSchema);
  });

  const removeValue = useEventCallback((value: string) => {
    const currentValues = [...values];
    currentValues.splice(currentValues.indexOf(value), 1);
    props.updateField(props.path, currentValues, props.schema, props.rootSchema);
  });

  const handleInputChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      addValue(event.target.id.substring(prefix.length));
    } else {
      removeValue(event.target.id.substring(prefix.length));
    }
  });

  if (isSortable) {
    return (
      <div className={isDisabled ? 'opacity-65' : ''}>
        <div className="mt-2 flex justify-between">
          <span className="flex gap-x-1.5">
            {title}
            <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
            {badges}
          </span>
        </div>
        <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          <DnDList onDragEnd={onDragEnd}>
            {definitions.map(definition => ({
              key: definition.value,
              item: (
                <Checkbox
                  id={definition.value}
                  isChecked={values.includes(definition.value)}
                  onChange={handleInputChange}
                  label={definition.title}
                  justify
                />
              ),
            }))}
          </DnDList>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
      </div>
    );
  }

  return (
    <div className={isDisabled ? 'opacity-65' : ''}>
      <div className="mt-2 flex justify-between">
        <span className="flex gap-x-1.5">
          {title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
      </div>
      <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        <div className="grow">
          {definitions.map(definition => (
            <Checkbox
              key={definition.value}
              id={prefix + definition.value}
              data-id={definition.value}
              isChecked={values.includes(definition.value)}
              onChange={handleInputChange}
              label={definition.title}
              justify
            />
          ))}
        </div>
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
    </div>
  );
}

export default EnumCheckboxList;
