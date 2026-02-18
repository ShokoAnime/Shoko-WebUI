import React from 'react';

import AnySchema from '@/components/Configuration/AnySchema';
import useListSections from '@/components/Configuration/hooks/useListSections';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function SectionContainerList(props: AnySchemaProps): React.JSX.Element | null {
  const { canAdd, sections, setItem: addItem, showAddButton } = useListSections(
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
  return (
    <>
      {sections.map(({ elements: [section], title }, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${title}-${index}`}
          {...props}
          schema={section.schema}
          parentConfig={props.config}
          config={section.config}
          path={section.path}
          renderHeader={false}
        />
      ))}

      {showAddButton
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
            </div>
          </>
        )
        : <div className="border-b border-panel-border" />}
    </>
  );
}

export default SectionContainerList;
