import React from 'react';

import FieldSetSection from '@/components/Configuration/SectionContainer/FieldSetSection';
import useSections from '@/components/Configuration/hooks/useSections';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';

function FieldSetSectionContainer(props: AnySchemaProps): React.JSX.Element {
  const { buttons: { auto: autoButtons, bottom: bottomButtons, top: topButtons }, sections } = useSections(
    props.rootSchema,
    props.schema,
    props.config,
    props.path,
    props.defaultSave,
    props.performAction,
    props.configHasChanged,
    props.modes,
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
        <FieldSetSection
          // eslint-disable-next-line react/no-array-index-key
          key={`${section.title}-${index}`}
          {...props}
          renderHeader={props.renderHeader
            && (sections.length > 1 || (sections.length === 1 && sections[0].title !== 'Default'))}
          section={section}
        />
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

export default FieldSetSectionContainer;
