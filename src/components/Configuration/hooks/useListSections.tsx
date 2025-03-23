import React, { useMemo } from 'react';
import { get, isEqual } from 'lodash';

import Button from '@/components/Input/Button';
import { createDefaultItemForSchema, pathToString, resolveListReference, resolveReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { ActionButtonType, SectionType } from '@/components/Configuration/hooks/useSections';
import type {
  ComplexListConfigurationUiDefinitionType,
  JSONSchema4WithUiDefinition,
  SectionsConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';

export type ListSectionType = {
  sections: SectionType[];
  showAddButton: boolean;
  addItem: () => void;
  canAdd: boolean;
  showRemoveButton: boolean;
  removeItem: (index: number) => void;
  canRemove: boolean;
};

function useListSections(
  rootSchema: JSONSchema4WithUiDefinition,
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  path: (string | number)[],
  updateField: (
    path: (string | number)[],
    value: unknown,
    schema: JSONSchema4WithUiDefinition,
    rootSchema: JSONSchema4WithUiDefinition,
  ) => void,
  performAction: (path: (string | number)[], action: string) => void,
  configHasChanged: boolean,
  addRemoveButton = false,
): ListSectionType {
  const configList = config as Record<string, unknown>[];
  const { itemDefinition, itemSchema, listDefinition, listSchema } = useMemo(() => {
    const schema0 = resolveReference(rootSchema, schema);
    const schema1 = resolveListReference(rootSchema, schema0);
    return {
      itemDefinition: schema1['x-uiDefinition'] as SectionsConfigurationUiDefinitionType,
      itemSchema: schema1,
      listDefinition: schema0['x-uiDefinition'] as ComplexListConfigurationUiDefinitionType,
      listSchema: schema0,
    };
  }, [rootSchema, schema]);
  const { canAdd, canRemove } = useMemo(() => ({
    canAdd: listSchema.maxItems == null || configList.length < listSchema.maxItems,
    canRemove: listSchema.minLength == null || configList.length > listSchema.minLength,
  }), [configList, listSchema]);

  const addItem = useEventCallback(() => {
    if (!canAdd) return;
    const item = createDefaultItemForSchema(rootSchema, itemSchema);
    updateField(path, [...(config as Record<string, unknown>[]), item], schema, rootSchema);
  });

  const removeItem = useEventCallback((index: number) => {
    if (!canRemove) return;
    const newConfigList = [...configList];
    newConfigList.splice(index, 1);
    updateField(path, newConfigList, schema, rootSchema);
  });

  const resolvedSections = useMemo(() => {
    const sections = new Array<SectionType>();
    const visibility = itemDefinition.visibility ?? { default: 'visible', advanced: false };
    const hideByDefault = visibility.default === 'hidden'
      && (!visibility.toggle || visibility.toggle.visibility === 'visible');
    const toggle = visibility.toggle && visibility.toggle.visibility === (hideByDefault ? 'visible' : 'hidden')
      ? { path: visibility.toggle.path, value: visibility.toggle.value }
      : null;
    for (const [index, item] of configList.entries()) {
      const itemPath = [...path, index];
      const itemTitle = (item[listDefinition.primaryKey] as string | undefined) ?? '';
      const itemKey = `item-${itemTitle}-${index}`;
      const buttons: ActionButtonType = { auto: [], top: [], bottom: [] };
      for (const [buttonIndex, action] of itemDefinition.actions.customActions.entries()) {
        const buttonKey = `action-${buttonIndex}`;
        const tooltip = action.description ? action.description : `${action.title}`;
        const disabled = action.disableIfNoChanges && !configHasChanged;
        if (action.toggle) {
          const value = get(item, action.toggle.path.split('.')) as unknown;
          const isToggled = isEqual(value, action.toggle.value);
          if (action.inverseToggle !== isToggled) {
            continue;
          }
        }
        const onClick = () => performAction(itemPath, action.title);
        const actionButton = (
          <Button
            key={buttonKey}
            disabled={disabled}
            buttonType={action.theme}
            buttonSize={action.position === 'top' ? 'small' : 'normal'}
            tooltip={tooltip}
            onClick={onClick}
          >
            {action.title}
          </Button>
        );
        switch (action.position) {
          case 'top':
            buttons.top.push(actionButton);
            break;
          case 'bottom':
            buttons.bottom.push(actionButton);
            break;
          default:
            buttons.auto.push(actionButton);
            break;
        }
      }
      if (addRemoveButton) {
        const removeButton = (
          <Button
            key={`remove-${itemKey}`}
            buttonType="danger"
            buttonSize="normal"
            tooltip="Remove"
            onClick={() => removeItem(index)}
          >
            Remove
          </Button>
        );
        buttons.bottom.push(removeButton);
      }
      sections.push({
        title: itemTitle,
        description: '',
        hideByDefault,
        toggle,
        config: item,
        elements: [{ key: itemKey, schema: itemSchema, config: item, parentConfig: item, path: itemPath }],
        buttons,
      });
    }

    return sections;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configList, itemDefinition, itemSchema, listDefinition, pathToString(path), performAction, configHasChanged]);

  return {
    sections: resolvedSections,
    showAddButton: !listDefinition.listHideAddAction,
    addItem,
    canAdd,
    showRemoveButton: !listDefinition.listHideRemoveAction,
    removeItem,
    canRemove,
  };
}

export default useListSections;
