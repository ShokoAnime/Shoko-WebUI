import React from 'react';

import AnySchema from '@/components/Configuration/AnySchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SectionType } from '@/components/Configuration/hooks/useSections';

function MinimalSection(
  props: Omit<AnySchemaProps, 'schema' | 'parentConfig'> & { section: SectionType },
): React.JSX.Element {
  const {
    section: { buttons: { auto: autoButtons, bottom: bottomButtons, top: topButtons }, description, elements, title },
  } = props;
  return (
    <>
      {props.renderHeader && (
        <div className="flex flex-col gap-y-1">
          <div className="flex flex-row gap-x-1">
            <div className="grow text-lg font-semibold">{title}</div>

            {topButtons.length > 0 && (
              <div className="justify-end gap-x-3 self-center font-semibold">
                {topButtons}
              </div>
            )}
          </div>

          {description && (
            <div className="text-xs">
              {description}
            </div>
          )}
        </div>
      )}

      {elements.map((element, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${element.key}-${index}`}
          {...props}
          parentSchema={element.parentSchema}
          schema={element.schema}
          parentConfig={props.config}
          config={element.config}
          path={[...props.path, element.key]}
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

export default MinimalSection;
