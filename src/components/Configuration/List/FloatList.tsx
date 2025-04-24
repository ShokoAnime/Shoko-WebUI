import React, { useMemo, useState } from 'react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import { resolveListReference, resolveReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import NumberModal from './NumberModal';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SimpleListConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';
import type { DropResult } from '@hello-pangea/dnd';

function FloatList(props: AnySchemaProps): React.JSX.Element | null {
  const values = props.config as number[];
  const [showModal, setShowModal] = useState(false);
  const { defaultValue, description, maxValue, minValue, resolvedSchema, title, uiDefinition } = useMemo(() => {
    const schema = resolveReference(props.rootSchema, props.schema);
    const itemSchema = resolveListReference(props.rootSchema, schema);
    return {
      minValue: itemSchema.minimum,
      maxValue: itemSchema.maximum,
      defaultValue: (itemSchema.default as number | undefined) ?? itemSchema.minimum ?? 0,
      resolvedSchema: schema,
      uiDefinition: schema['x-uiDefinition'] as SimpleListConfigurationUiDefinitionType,
      title: props.schema.title ?? schema.title ?? props.path[props.path.length - 1]?.toString() ?? '<unknown>',
      description: props.schema.description ?? schema.description ?? '',
    };
  }, [props.rootSchema, props.schema, props.path]);
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.advancedMode,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const isSortable = visibility === 'visible' && uiDefinition.listSortable;
  const showAddButton = visibility === 'visible' && !uiDefinition.listHideAddAction;
  const showRemoveButton = visibility === 'visible' && !uiDefinition.listHideRemoveAction;

  const onDragEnd = useEventCallback((result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const newValues = [...values];
    const [removed] = newValues.splice(result.source.index, 1);
    newValues.splice(result.destination.index, 0, removed);
    props.updateField(props.path, newValues, props.schema, props.rootSchema);
  });

  const onModalOpen = useEventCallback(() => {
    setShowModal(true);
  });

  const onModalClose = useEventCallback(() => {
    setShowModal(false);
  });

  const addValue = useEventCallback((value: number) => {
    if (uiDefinition.listUniqueItems && values.includes(value)) return;
    props.updateField(props.path, [...values, value], props.schema, props.rootSchema);
  });

  const removeValue = useEventCallback((value: number) => {
    const currentValues = [...values];
    currentValues.splice(currentValues.indexOf(value), 1);
    props.updateField(props.path, currentValues, props.schema, props.rootSchema);
  });

  if (isSortable) {
    return (
      <>
        <div className={isDisabled ? 'opacity-65' : ''}>
          <div className="mt-2 flex justify-between">
            <span className="flex gap-x-1.5">
              {title}
              <span className="self-center text-xs opacity-65">(Drag to Reorder)</span>
              {badges}
            </span>
            {showAddButton && (
              <Button onClick={onModalOpen} tooltip="Add">
                <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
              </Button>
            )}
          </div>
          <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
            <DnDList onDragEnd={onDragEnd}>
              {values.map((value, index) => ({
                key: value.toString(10) + index,
                item: (
                  <div className="mt-2.5 flex items-center justify-between group-first:mt-0">
                    {value}
                    {showRemoveButton && (
                      <Button onClick={() => removeValue(value)} tooltip="Remove">
                        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    )}
                  </div>
                ),
              }))}
            </DnDList>
          </div>
          <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
        </div>
        <NumberModal
          addValue={addValue}
          default={defaultValue}
          integer={false}
          max={maxValue}
          min={minValue}
          onClose={onModalClose}
          show={showModal}
          title={title}
          values={values}
        />
      </>
    );
  }

  return (
    <>
      <div className={isDisabled ? 'opacity-65' : ''}>
        <div className="mt-2 flex justify-between">
          <span className="flex gap-x-1.5">
            {title}
            {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
            {badges}
          </span>
          {showAddButton && (
            <Button onClick={onModalOpen} tooltip="Add">
              <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
            </Button>
          )}
        </div>
        <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          <div className="grow">
            {values.map(value => (
              <div key={value} className="mt-2.5 flex items-center justify-between group-first:mt-0">
                {value}
                {showRemoveButton && (
                  <Button onClick={() => removeValue(value)} tooltip="Remove">
                    <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
      </div>
      <NumberModal
        addValue={addValue}
        default={defaultValue}
        integer={false}
        max={maxValue}
        min={minValue}
        onClose={onModalClose}
        show={showModal}
        title={title}
        values={values}
      />
    </>
  );
}

export default FloatList;
