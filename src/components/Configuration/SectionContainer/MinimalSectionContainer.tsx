import React from 'react';

import MinimalSection from '@/components/Configuration/SectionContainer/MinimalSection';
import useSections from '@/components/Configuration/hooks/useSections';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function MinimalSectionContainer(props: AnySchemaProps): React.JSX.Element {
  const { buttons: { auto: autoButtons, bottom: bottomButtons, top: topButtons }, sections } = useSections(
    props.rootSchema,
    props.schema,
    props.config,
    props.path,
    props.performAction,
    props.configHasChanged,
  );
  return (
    <>
      {(topButtons.length > 0) && (
        <>
          <div className="flex justify-end gap-x-3 font-semibold">
            {topButtons}
          </div>

          <div className="border-b border-panel-border" />
        </>
      )}

      {sections.map((section, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`${section.title}-${index}`}>
          {index !== 0 && <div className="border-b border-panel-border" />}

          <MinimalSection
            rootSchema={props.rootSchema}
            config={props.config}
            path={props.path}
            restartPendingFor={props.restartPendingFor}
            loadedEnvironmentVariables={props.loadedEnvironmentVariables}
            advancedMode={props.advancedMode}
            performAction={props.performAction}
            updateField={props.updateField}
            renderHeader={sections.length > 1}
            configHasChanged={props.configHasChanged}
            section={section}
          />
        </React.Fragment>
      ))}

      {(autoButtons.length > 0 || bottomButtons.length > 0) && (
        <>
          <div className="border-b border-panel-border" />

          <div className="flex justify-end gap-x-3 font-semibold">
            {[...autoButtons, ...bottomButtons]}
          </div>
        </>
      )}
    </>
  );
}

export default MinimalSectionContainer;
