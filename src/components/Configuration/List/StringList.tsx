import React, { useState } from 'react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import StringModal from './StringModal';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SimpleListConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';
import type { DropResult } from '@hello-pangea/dnd';

function StringList(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const uiDefinition = resolvedSchema['x-uiDefinition'] as SimpleListConfigurationUiDefinitionType;
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1]?.toString()
    ?? '<unknown>';
  const [showModal, setShowModal] = useState(false);
  const description = props.schema.description ?? resolvedSchema.description ?? '';
  const values = props.config as string[];
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

  const handleAddValue = useEventCallback((value: string) => {
    if (uiDefinition.listUniqueItems && values.includes(value)) return;
    props.updateField(props.path, [...values, value], props.schema, props.rootSchema);
  });

  const handleRemoveValue = useEventCallback((value: string) => {
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
                key: value + index,
                item: (
                  <div className="mt-2.5 flex items-center justify-between group-first:mt-0">
                    {value}
                    {showRemoveButton && (
                      <Button onClick={() => handleRemoveValue(value)} tooltip="Remove">
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
        <StringModal
          onClose={onModalClose}
          addValue={handleAddValue}
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
          <div className="group grow">
            {values.map(value => (
              <div key={value} className="mt-2.5 flex items-center justify-between group-first:mt-0">
                {value}
                {showRemoveButton && (
                  <Button onClick={() => handleRemoveValue(value)} tooltip="Remove">
                    <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
      </div>
      <StringModal
        onClose={onModalClose}
        addValue={handleAddValue}
        show={showModal}
        title={title}
        values={values}
      />
    </>
  );
}

export default StringList;
