import React, { useMemo } from 'react';
import * as icons from '@mdi/js';
import Icon from '@mdi/react';
import { get, isEqual } from 'lodash';

import { getVisibility } from '@/components/Configuration/hooks/useVisibility';
import Button from '@/components/Input/Button';
import { pathToString, resolveListReference, resolveReference } from '@/core/schema';
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
  setItem: (item?: unknown, index?: number) => void;
  canAdd: boolean;
  showRemoveButton: boolean;
  removeItem: (index: number) => void;
  canRemove: boolean;
};

function getAny(target: object, keys: string[]): string | null {
  for (const key of Reflect.ownKeys(target)) {
    if (typeof key === 'string' && keys.includes(key.toLowerCase()) && target[key] != null) {
      return String(target[key]);
    }
  }
  return null;
}

export function getPrimaryKey(target: unknown): { title: string, category: string | null };
export function getPrimaryKey(target: unknown, strict: false): { title: string | null, category: string | null };
export function getPrimaryKey(target: unknown, strict: true): { title: string, category: string | null };
export function getPrimaryKey(target: unknown, strict?: boolean): { title: string | null, category: string | null };
export function getPrimaryKey(
  target: unknown,
  strict = true,
): { title: string | null, category: string | null } {
  if (target == null) {
    return { title: '', category: null };
  }
  switch (typeof target) {
    case 'object': {
      if (target instanceof Array) {
        let title: string | null = String(target[0]).trim();
        if (!strict && title === '') {
          title = null;
        }
        const category = target[1] != null ? String(target[1]).trim() || null : null;
        return { title, category };
      }
      let title: string | null = getAny(target, ['title', 'id', 'value', 'name', 'label', 'primary'])?.trim() ?? '';
      if (!strict && title === '') {
        title = null;
      }
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const category = getAny(target, ['category', 'type', 'key', 'group', 'secondary'])?.trim() || null;
      return { title, category };
    }
    case 'string':
      return { title: target.trim() || (strict ? '' : null), category: null };
    case 'bigint':
    case 'number':
    case 'boolean':
    case 'symbol':
      return { title: String(target).trim() || (strict ? '' : null), category: null };
    default:
      return { title: strict ? '' : null, category: null };
  }
}

// eslint-disable-next-line react-refresh/only-export-components
const EmptyArray: readonly never[] = [];

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
  defaultSave: (() => void) | undefined,
  performAction: ((path: (string | number)[], action: string) => void) | undefined,
  configHasChanged: boolean,
  addRemoveButton = false,
): ListSectionType {
  const configList = config as Record<string, unknown>[] || EmptyArray;
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

  const setItem = useEventCallback((item?: unknown, index?: number) => {
    if (index != null && index < configList.length && index >= 0) {
      const newConfigList = [...configList];
      newConfigList.splice(index, 1, item as Record<string, unknown>);
      updateField(path, newConfigList, schema, rootSchema);
      return;
    }
    if (!canAdd) return;
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
    for (const [index, item] of configList.entries()) {
      const visibility = getVisibility(itemSchema, item, { advanced: false, debug: false }, []);
      if (visibility === 'hidden') return sections;
      const itemPath = [...path, index];
      const { category: itemCategory, title: itemTitle } = getPrimaryKey(item[listDefinition.primaryKey]);
      const itemKey = `item-${itemTitle}-${index}`;
      const buttons: ActionButtonType = { auto: [], top: [], bottom: [] };
      if (performAction) {
        for (const [actionId, action] of Object.entries(itemDefinition.actions)) {
          const buttonKey = `action-${actionId}`;
          const tooltip = action.description ? action.description : `${action.title}`;
          let disabled = action.disableIfNoChanges && !configHasChanged;
          if (!disabled && action.disableToggle) {
            const value = get(item, action.disableToggle.path.split('.')) as unknown;
            const isDisabled = isEqual(value, action.disableToggle.value);
            disabled = action.disableToggle.inverseCondition !== isDisabled;
          }
          if (action.toggle) {
            const value = get(item, action.toggle.path.split('.')) as unknown;
            const isToggled = isEqual(value, action.toggle.value);
            if (action.toggle.inverseCondition !== isToggled) {
              continue;
            }
          }
          const iconPath = action.icon && icons[`mdi${action.icon}`] != null
            ? icons[`mdi${action.icon}`] as string
            : undefined;
          const onClick = () => performAction(itemPath, actionId);
          const actionButton = listDefinition.listType === 'complex-inline'
            ? (
              <Button
                key={buttonKey}
                className="text-panel-icon-action"
                disabled={disabled}
                tooltip={tooltip}
                onClick={onClick}
              >
                {iconPath
                  ? <Icon path={iconPath} size={1} />
                  : action.title}
              </Button>
            )
            : (
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
      }
      if (addRemoveButton) {
        const removeButton = listDefinition.listType === 'complex-inline'
          ? (
            <Button
              className="text-panel-icon-action"
              key={`remove-${itemKey}`}
              tooltip="Remove Item"
              onClick={() => removeItem(index)}
            >
              <Icon path={icons.mdiMinusCircleOutline} size={1} />
            </Button>
          )
          : (
            <Button
              key={`remove-${itemKey}`}
              buttonType="danger"
              buttonSize="normal"
              tooltip="Remove Item"
              onClick={() => removeItem(index)}
            >
              Remove
            </Button>
          );
        buttons.bottom.push(removeButton);
      }
      if (defaultSave && itemDefinition.showSaveAction) {
        const actionButton = (
          <Button
            key="default-save"
            buttonType="primary"
            buttonSize="normal"
            onClick={defaultSave}
            disabled={!configHasChanged}
          >
            Save
          </Button>
        );
        buttons.bottom.push(actionButton);
      }
      sections.push({
        title: itemTitle,
        category: itemCategory,
        description: '',
        elements: [{
          key: itemKey,
          schema: itemSchema,
          config: item,
          parentConfig: item,
          parentSchema: listSchema,
          path: itemPath,
        }],
        buttons,
      });
    }

    return sections;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    configList,
    itemDefinition,
    itemSchema,
    listDefinition,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pathToString(path),
    defaultSave,
    performAction,
    configHasChanged,
  ]);

  return {
    sections: resolvedSections,
    showAddButton: !listDefinition.listHideAddAction,
    setItem,
    canAdd,
    showRemoveButton: !listDefinition.listHideRemoveAction,
    removeItem,
    canRemove,
  };
}

export default useListSections;
