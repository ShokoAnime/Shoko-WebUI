import React from 'react';

import AnySchema from '@/components/Configuration/AnySchema';
import ListTabPills from '@/components/Configuration/List/ListTabPills';
import useListSections from '@/components/Configuration/hooks/useListSections';
import useTabs from '@/components/Configuration/hooks/useTabs';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function TabSectionContainerList(props: AnySchemaProps): React.JSX.Element | null {
  const { addItem, canAdd, canRemove, removeItem, sections, showAddButton, showRemoveButton } = useListSections(
    props.rootSchema,
    props.schema,
    props.config,
    props.path,
    props.updateField,
    props.performAction,
    props.configHasChanged,
  );
  const [{ elements = [] } = {}, tabs] = useTabs(sections, props.path);
  return (
    <>
      <ListTabPills
        tabs={tabs}
        addItem={addItem}
        canAdd={canAdd}
        removeItem={removeItem}
        canRemove={canRemove}
        showAddButton={showAddButton}
        showRemoveButton={showRemoveButton}
      />

      {elements.length > 0 && <div className="border-b border-panel-border" />}

      {elements.map((element, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${element.key}-${index}`}
          rootSchema={props.rootSchema}
          schema={element.schema}
          parentConfig={props.config}
          config={element.config}
          path={element.path}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader={false}
          configHasChanged={props.configHasChanged}
        />
      ))}
    </>
  );
}

export default TabSectionContainerList;
