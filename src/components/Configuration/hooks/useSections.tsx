import React, { useMemo } from 'react';
import { get, isEqual } from 'lodash';

import { getVisibility } from '@/components/Configuration/hooks/useVisibility';
import Button from '@/components/Input/Button';
import { resolveReference } from '@/core/schema';

import type {
  JSONSchema4WithUiDefinition,
  SectionsConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';

export type SectionElementType = {
  key: string;
  schema: JSONSchema4WithUiDefinition;
  parentConfig: unknown;
  config: unknown;
  path: (string | number)[];
};

export type SectionType = {
  title: string;
  category: string | null;
  description: string | null;
  elements: SectionElementType[];
  buttons: ActionButtonType;
};

export type ActionButtonType = {
  auto: React.JSX.Element[];
  top: React.JSX.Element[];
  bottom: React.JSX.Element[];
};

function useSections(
  rootSchema: JSONSchema4WithUiDefinition,
  schema: JSONSchema4WithUiDefinition,
  config: unknown,
  path: (string | number)[],
  defaultSave: (() => void) | undefined,
  performAction: ((path: (string | number)[], action: string) => void) | undefined,
  configHasChanged: boolean,
  modes: { advanced: boolean, debug: boolean },
): { buttons: ActionButtonType, sections: SectionType[] } {
  return useMemo(() => {
    const resolvedContainerSchema = resolveReference(rootSchema, schema);
    const { actions, sectionAppendFloatingAtEnd, sectionName: defaultSectionName = 'Default', showSaveAction } =
      resolvedContainerSchema['x-uiDefinition']! as SectionsConfigurationUiDefinitionType;
    const sections = new Array<SectionType>();
    const extraSection = new Map<string, SectionElementType[]>();
    const buttons = new Map<string | undefined, ActionButtonType>([[defaultSectionName, {
      auto: [],
      top: [],
      bottom: [],
    }]]);
    if (performAction) {
      for (const [actionId, action] of Object.entries(actions)) {
        const key = `action-${actionId}`;
        const tooltip = action.description ? action.description : `${action.title}`;
        let disabled = action.disableIfNoChanges && !configHasChanged;
        if (!disabled && action.disableToggle) {
          const value = get(config, action.disableToggle.path.split('.')) as unknown;
          const isDisabled = isEqual(value, action.disableToggle.value);
          disabled = action.disableToggle.inverseCondition === isDisabled;
        }
        if (action.toggle) {
          const value = get(config, action.toggle.path.split('.')) as unknown;
          const isToggled = isEqual(value, action.toggle.value);
          if (action.toggle.inverseCondition !== isToggled) {
            continue;
          }
        }
        const onClick = () => performAction(path, actionId);
        const actionButton = (
          <Button
            key={key}
            disabled={disabled}
            buttonType={action.theme}
            buttonSize={action.position === 'top' ? 'small' : 'normal'}
            tooltip={tooltip}
            onClick={onClick}
          >
            {action.title}
          </Button>
        );
        let buttonList = buttons.get(action.sectionName ?? defaultSectionName);
        if (!buttonList) {
          buttons.set(action.sectionName ?? defaultSectionName, buttonList = { auto: [], top: [], bottom: [] });
        }
        switch (action.position) {
          case 'top':
            buttonList.top.push(actionButton);
            break;
          case 'bottom':
            buttonList.bottom.push(actionButton);
            break;
          default:
            buttonList.auto.push(actionButton);
            break;
        }
      }
    }
    if (defaultSave && showSaveAction) {
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
      let buttonList = buttons.get(defaultSectionName);
      if (!buttonList) {
        buttons.set(defaultSectionName, buttonList = { auto: [], top: [], bottom: [] });
      }
      buttonList.bottom.push(actionButton);
    }

    for (
      const [key, value] of Object.entries(
        resolvedContainerSchema.properties! as Record<string, JSONSchema4WithUiDefinition>,
      )
    ) {
      if (resolvedContainerSchema === rootSchema && key === '$schema') continue;
      const subConfig = (config as Record<string, unknown>)[key];
      const resolvedSchema = resolveReference(rootSchema, value);
      const visibility = getVisibility(
        value,
        config,
        modes,
        [],
      );
      if (visibility === 'hidden') continue;
      const uiDefinition = Object.assign({}, value['x-uiDefinition']!, resolvedSchema['x-uiDefinition']!);
      const sectionName = uiDefinition.sectionName ?? defaultSectionName;
      if (uiDefinition.sectionName) {
        let sectionList = extraSection.get(sectionName);
        if (!sectionList) {
          extraSection.set(sectionName, sectionList = []);
        }
        sectionList.push({
          key,
          schema: value,
          config: subConfig,
          parentConfig: config,
          path: [...path, key],
        });
      } else if (uiDefinition.elementType === 'section-container') {
        sections.push({
          title: value?.title ?? resolvedSchema.title ?? key,
          category: null,
          description: value.description ?? resolvedSchema.description ?? null,
          elements: [{ key, schema: resolvedSchema, config: subConfig, parentConfig: config, path }],
          buttons: { auto: [], top: [], bottom: [] },
        });
      } else if (uiDefinition.elementType === 'list' && uiDefinition.listElementType === 'section-container') {
        sections.push({
          title: value?.title ?? resolvedSchema.title ?? key,
          category: null,
          description: value.description ?? resolvedSchema.description ?? null,
          elements: [{ key, schema: resolvedSchema, config: subConfig, parentConfig: config, path }],
          buttons: { auto: [], top: [], bottom: [] },
        });
      } else {
        let sectionList = extraSection.get(sectionName);
        if (!sectionList) {
          extraSection.set(sectionName, sectionList = []);
        }
        sectionList.push({
          key,
          schema: value,
          config: subConfig,
          parentConfig: config,
          path: [...path, key],
        });
      }
    }

    // Add the default section if there are non-section props and this is a tab section container.
    if (extraSection.size > 0) {
      if (sectionAppendFloatingAtEnd) {
        for (const [title, elements] of extraSection) {
          sections.push({
            title: extraSection.size === 1 && sections.length === 0 && title === defaultSectionName && schema.title
              ? schema.title
              : title,
            category: null,
            description:
              extraSection.size === 1 && sections.length === 0 && title === defaultSectionName && schema.title
                ? schema.description ?? null
                : null,
            elements,
            buttons: buttons.get(title) ?? { auto: [], top: [], bottom: [] },
          });
        }
      } else {
        for (const [title, elements] of Array.from(extraSection).reverse()) {
          sections.unshift({
            title: extraSection.size === 1 && sections.length === 0 && title === defaultSectionName && schema.title
              ? schema.title
              : title,
            category: null,
            description:
              extraSection.size === 1 && sections.length === 0 && title === defaultSectionName && schema.title
                ? schema.description ?? null
                : null,
            elements,
            buttons: buttons.get(title) ?? { auto: [], top: [], bottom: [] },
          });
        }
      }
      return { buttons: { auto: [], top: [], bottom: [] }, sections };
    }

    return { buttons: buttons.get(defaultSectionName)!, sections };
  }, [rootSchema, schema, config, path, defaultSave, performAction, configHasChanged, modes]);
}

export default useSections;
