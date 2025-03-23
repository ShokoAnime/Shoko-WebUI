import React, { useMemo } from 'react';
import { get, isEqual } from 'lodash';

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
  description: string | null;
  hideByDefault: boolean;
  toggle: { path: string, value: unknown } | null;
  config: unknown;
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
  performAction: (path: (string | number)[], action: string) => void,
  configHasChanged: boolean,
): { buttons: ActionButtonType, sections: SectionType[] } {
  return useMemo(() => {
    const { actions: { customActions }, sectionAppendFloatingAtEnd, sectionName: defaultSectionName = 'Default' } =
      schema['x-uiDefinition']! as SectionsConfigurationUiDefinitionType;
    const sections = new Array<SectionType>();
    const extraSection = new Map<string, SectionElementType[]>();
    const buttons = new Map<string | undefined, ActionButtonType>([[defaultSectionName, {
      auto: [],
      top: [],
      bottom: [],
    }]]);
    for (const [index, action] of customActions.entries()) {
      const key = `action-${index}`;
      const tooltip = action.description ? action.description : `${action.title}`;
      const disabled = action.disableIfNoChanges && !configHasChanged;
      if (action.toggle) {
        const value = get(config, action.toggle.path.split('.')) as unknown;
        const isToggled = isEqual(value, action.toggle.value);
        if (action.inverseToggle !== isToggled) {
          continue;
        }
      }
      const onClick = () => performAction(path, action.title);
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

    for (const [key, value] of Object.entries(schema.properties! as Record<string, JSONSchema4WithUiDefinition>)) {
      if (schema === rootSchema && key === '$schema') continue;

      const subConfig = (config as Record<string, unknown>)[key];
      const resolvedSchema = resolveReference(rootSchema, value);
      const uiDefinition = Object.assign({}, value['x-uiDefinition']!, resolvedSchema['x-uiDefinition']!);
      const sectionName = uiDefinition.sectionName ?? defaultSectionName;
      if (uiDefinition.sectionName) {
        let sectionList = extraSection.get(sectionName);
        if (!sectionList) {
          extraSection.set(sectionName, sectionList = []);
        }
        sectionList.push({ key, schema: value, config: subConfig, parentConfig: config, path: [...path, key] });
      } else if (uiDefinition.elementType === 'section-container') {
        const visibility = uiDefinition.visibility ?? { default: 'visible', advanced: false };
        const hideByDefault = visibility.default === 'hidden'
          && (!visibility.toggle || visibility.toggle.visibility === 'visible');
        const toggle = visibility.toggle && visibility.toggle.visibility === (hideByDefault ? 'visible' : 'hidden')
          ? { path: visibility.toggle.path, value: visibility.toggle.value }
          : null;
        sections.push({
          title: value?.title ?? resolvedSchema.title ?? key,
          description: value.description ?? resolvedSchema.description ?? null,
          hideByDefault,
          toggle,
          config,
          elements: [{ key, schema: value, config: subConfig, parentConfig: config, path }],
          buttons: { auto: [], top: [], bottom: [] },
        });
      } else if (uiDefinition.elementType === 'list' && uiDefinition.listElementType === 'section-container') {
        const visibility = uiDefinition.visibility ?? { default: 'visible', advanced: false };
        const hideByDefault = visibility.default === 'hidden'
          && (!visibility.toggle || visibility.toggle.visibility === 'visible');
        const toggle = visibility.toggle && visibility.toggle.visibility === (hideByDefault ? 'visible' : 'hidden')
          ? { path: visibility.toggle.path, value: visibility.toggle.value }
          : null;
        sections.push({
          title: value?.title ?? resolvedSchema.title ?? key,
          description: value.description ?? resolvedSchema.description ?? null,
          hideByDefault,
          toggle,
          config,
          elements: [{ key, schema: value, config: subConfig, parentConfig: config, path }],
          buttons: { auto: [], top: [], bottom: [] },
        });
      } else {
        let sectionList = extraSection.get(sectionName);
        if (!sectionList) {
          extraSection.set(sectionName, sectionList = []);
        }
        sectionList.push({ key, schema: value, config: subConfig, parentConfig: config, path: [...path, key] });
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
            description: null,
            hideByDefault: false,
            toggle: null,
            config: null,
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
            description: null,
            hideByDefault: false,
            toggle: null,
            config: null,
            elements,
            buttons: buttons.get(title) ?? { auto: [], top: [], bottom: [] },
          });
        }
      }
      return { buttons: { auto: [], top: [], bottom: [] }, sections };
    }

    return { buttons: buttons.get(defaultSectionName)!, sections };
  }, [rootSchema, schema, config, path, performAction, configHasChanged]);
}

export default useSections;
