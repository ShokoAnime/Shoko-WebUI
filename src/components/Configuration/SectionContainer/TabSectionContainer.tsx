import React from 'react';

import AnySchema from '@/components/Configuration/AnySchema';
import useSections from '@/components/Configuration/hooks/useSections';
import useTabs from '@/components/Configuration/hooks/useTabs';
import TabPills from '@/components/TabPills';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function TabSectionContainer(props: AnySchemaProps): React.JSX.Element {
  const { buttons: { auto: autoButtons, bottom: bottomButtons, top: topButtons }, sections } = useSections(
    props.rootSchema,
    props.schema,
    props.config,
    props.path,
    props.performAction,
    props.configHasChanged,
    props.advancedMode,
  );
  const [
    {
      buttons: { auto: sectionAutoButtons = [], bottom: sectionBottomButtons = [], top: sectionTopButtons = [] } = {},
      description,
      elements = [],
    } = {},
    tabs,
  ] = useTabs(sections, props.path);
  return (
    <>
      <TabPills tabs={tabs} />

      <div className="border-b border-panel-border" />

      <div className="flex flex-row gap-x-1">
        <div className="flex grow flex-col">
          {description ?? 'No description provided.'}
        </div>

        {(sectionTopButtons.length > 0 || topButtons.length > 0) && (
          <div className="justify-end gap-x-3 self-center font-semibold">
            {[...sectionTopButtons, ...topButtons]}
          </div>
        )}
      </div>

      <div className="border-b border-panel-border" />

      {elements.map((element, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${element.key}-${index}`}
          rootSchema={props.rootSchema}
          schema={element.schema}
          parentConfig={props.config}
          config={element.config}
          path={[...props.path, element.key]}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader
          configHasChanged={props.configHasChanged}
        />
      ))}

      {(autoButtons.length > 0 || bottomButtons.length > 0 || sectionAutoButtons.length > 0
        || sectionBottomButtons.length > 0) && (
        <div className="flex justify-end gap-x-3 font-semibold">
          {[...sectionAutoButtons, ...sectionBottomButtons, ...autoButtons, ...bottomButtons]}
        </div>
      )}
    </>
  );
}

export default TabSectionContainer;
