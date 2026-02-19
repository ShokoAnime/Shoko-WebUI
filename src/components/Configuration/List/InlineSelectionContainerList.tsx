/* eslint-disable react/no-array-index-key */
import React from 'react';
import { mdiCircleEditOutline, mdiPlusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useListSections from '@/components/Configuration/hooks/useListSections';
import useSingleView from '@/components/Configuration/hooks/useSingleView';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import PopOutModal from './PopOutModal';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { ComplexListConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';
import type { DropResult } from '@hello-pangea/dnd';

function InlineSectionContainerList(props: AnySchemaProps): React.JSX.Element | null {
  const resolvedSchema = useReference(props.rootSchema, props.schema);
  const uiDefinition = resolvedSchema['x-uiDefinition'] as ComplexListConfigurationUiDefinitionType;
  const title = props.schema.title ?? resolvedSchema.title ?? props.path[props.path.length - 1]?.toString()
    ?? '<unknown>';
  const description = props.schema.description ?? resolvedSchema.description ?? '';
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
  const values = props.config as Record<string, unknown>[];
  const { canAdd, sections, setItem, showAddButton } = useListSections(
    props.rootSchema,
    props.schema,
    props.config,
    props.path,
    props.updateField,
    props.defaultSave,
    props.performAction,
    props.configHasChanged,
    !uiDefinition.listHideRemoveAction,
  );
  const [, currentIndex, setView] = useSingleView(sections, props.path);
  const onDragEnd = useEventCallback((result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const newValues = [...values];
    const [removed] = newValues.splice(result.source.index, 1);
    newValues.splice(result.destination.index, 0, removed);
    props.updateField(props.path, newValues, props.schema, props.rootSchema);
  });

  const onModalOpen = useEventCallback((event: React.MouseEvent) => {
    const index = event.currentTarget?.parentElement?.parentElement?.dataset?.index;
    if (index == null) {
      setView(null);
      return;
    }

    setView(parseInt(index, 10));
  });

  const onModalClose = useEventCallback(() => {
    setView(undefined);
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
              {sections.map((value, index) => ({
                key: `section-${index}-${value.title}`,
                item: (
                  <div
                    data-index={index}
                    className="mt-2.5 flex items-center justify-between group-first:mt-0"
                  >
                    <span className="flex gap-x-1.5">
                      {value.title}
                      {value.category && (
                        <span className="self-center text-xs opacity-65">
                          (
                          {value.category}
                          )
                        </span>
                      )}
                    </span>
                    <div className="flex gap-x-3">
                      <Button onClick={onModalOpen} tooltip="Edit Item" disabled={!canAdd}>
                        <Icon className="text-panel-icon-action" path={mdiCircleEditOutline} size={1} />
                      </Button>
                      {value.buttons.top}
                      {value.buttons.auto}
                      {value.buttons.bottom}
                    </div>
                  </div>
                ),
              }))}
            </DnDList>
          </div>
          <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
        </div>
        <PopOutModal
          onClose={onModalClose}
          setValue={setItem}
          show={currentIndex !== undefined}
          title={title}
          serverControlled={props.serverControlled}
          rootConfig={props.rootConfig}
          index={currentIndex}
          path={props.path}
          parentSchema={props.schema}
          rootSchema={props.rootSchema}
          modes={props.modes}
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
            <Button onClick={onModalOpen} tooltip="Add Item" disabled={!canAdd}>
              <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
            </Button>
          )}
        </div>
        <div className="mt-2 flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          <div className="group grow">
            {sections.map((value, index) => (
              <div
                key={`section-${index}-${value.title}`}
                data-index={index}
                className="mt-2.5 flex items-center justify-between group-first:mt-0"
              >
                {value.title}
                <div className="flex gap-x-3">
                  <Button onClick={onModalOpen} tooltip="Edit Item" disabled={!canAdd}>
                    <Icon className="text-panel-icon-action" path={mdiCircleEditOutline} size={1} />
                  </Button>
                  {value.buttons.top}
                  {value.buttons.auto}
                  {value.buttons.bottom}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">{description}</div>
      </div>
      <PopOutModal
        onClose={onModalClose}
        setValue={setItem}
        show={currentIndex !== undefined}
        title={title}
        serverControlled={props.serverControlled}
        rootConfig={props.rootConfig}
        index={currentIndex}
        path={props.path}
        parentSchema={props.schema}
        rootSchema={props.rootSchema}
        modes={props.modes}
      />
    </>
  );
}

export default InlineSectionContainerList;
