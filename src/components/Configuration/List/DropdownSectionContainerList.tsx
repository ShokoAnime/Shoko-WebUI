import React, { useMemo } from 'react';
import cx from 'classnames';
import { forEach, groupBy, map } from 'lodash';

import AnySchema from '@/components/Configuration/AnySchema';
import useListSections from '@/components/Configuration/hooks/useListSections';
import useTabs from '@/components/Configuration/hooks/useTabs';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import SelectSmall from '@/components/Input/SelectSmall';
import { pathToString } from '@/core/schema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function DropdownSectionContainerList(props: AnySchemaProps): React.JSX.Element | null {
  const { canAdd, canRemove, removeItem, sections, setItem: addItem, showAddButton, showRemoveButton } =
    useListSections(
      props.rootSchema,
      props.schema,
      props.config,
      props.path,
      props.updateField,
      props.defaultSave,
      props.performAction,
      props.configHasChanged,
      true,
    );
  const visibility = useVisibility(
    props.schema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const [section, tabs] = useTabs(sections, props.path);
  const { elements = [] } = section ?? {};
  const { currentValue, definitions } = useMemo(() => {
    if (!tabs.length) {
      return {
        currentValue: '',
        definitions: [
          <option key="empty" value="">
            -
          </option>,
        ],
      };
    }

    const defList: React.ReactElement[] = [];
    forEach(groupBy(tabs, 'category'), (value, key) => {
      if (key === 'null') {
        forEach(value, (tab, tabIdx) => {
          defList.push(
            // eslint-disable-next-line react/no-array-index-key
            <option key={`ungrouped-${tab.name?.toString()}-${tabIdx}`} value={tabIdx.toString()}>
              {tab.name}
            </option>,
          );
        });
        return;
      }
      defList.push(
        <optgroup key={`group-${key}`} label={key}>
          {map(value, (tab, tabIdx) => (
            // eslint-disable-next-line react/no-array-index-key
            <option key={`${tab.name?.toString()}-${tabIdx}`} value={tabIdx.toString()}>
              {tab.name}
            </option>
          ))}
        </optgroup>,
      );
    });
    return {
      currentValue: tabs.findIndex(tab => tab.current).toString(),
      definitions: defList,
    };
  }, [tabs]);

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tab = tabs[parseInt(event.target.value, 10)];
    if (tab) {
      tab.onClick();
    }
  };

  const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const tab = tabs.findIndex(tabDef => tabDef.current);
    if (tab === -1) {
      return;
    }
    removeItem(tab);
  };

  return (
    <>
      <div>
        <div className="flex flex-col justify-between">
          <span className={cx('transition-opacity', isDisabled && 'opacity-65')}>{props.schema.title}</span>
          <SelectSmall
            className="w-full flex-col"
            id={`${pathToString(props.path)}-dropdown`}
            value={currentValue}
            disabled={isDisabled || isReadOnly}
            onChange={onChange}
          >
            {definitions}
          </SelectSmall>
        </div>
        <div className="mt-1 text-sm text-panel-text opacity-65">{props.schema.description ?? ''}</div>
      </div>

      {elements.map((element, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${element.key}-${index}`}
          {...props}
          schema={element.schema}
          parentConfig={props.config}
          config={element.config}
          path={element.path}
          updateField={props.updateField}
          renderHeader={false}
        />
      ))}

      {showAddButton || showRemoveButton
        ? (
          <>
            <div className="border-b border-panel-border" />

            <div className="flex justify-end gap-x-3 font-semibold">
              {showAddButton && (
                <button
                  className="text-sm"
                  type="button"
                  onClick={addItem}
                  disabled={!canAdd}
                >
                  Add
                </button>
              )}
              {showRemoveButton && (
                <button
                  className="text-sm"
                  type="button"
                  onClick={onRemove}
                  disabled={!canRemove}
                >
                  Remove
                </button>
              )}
            </div>
          </>
        )
        : <div className="border-b border-panel-border" />}
    </>
  );
}

export default DropdownSectionContainerList;
