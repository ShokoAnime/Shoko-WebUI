import React from 'react';

import AnySchema from '@/components/Configuration/AnySchema';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { SectionType } from '@/components/Configuration/hooks/useSections';

function FieldSetSection(
  props: Omit<AnySchemaProps, 'schema' | 'parentConfig'> & { section: SectionType },
): React.JSX.Element {
  const {
    section: { buttons: { auto: autoButtons, bottom: bottomButtons, top: topButtons }, description, elements, title },
  } = props;
  if (props.renderHeader) {
    return (
      <fieldset className="flex flex-col gap-y-3 border border-solid border-panel-border p-3">
        <legend className="text-sm">{title}</legend>

        {description && (
          <>
            <div className="text-sm">{description}</div>

            <div className="border-b border-panel-border" />
          </>
        )}

        {elements.map((element, index) => (
          <AnySchema
            // eslint-disable-next-line react/no-array-index-key
            key={`${element.key}-${index}`}
            rootSchema={props.rootSchema}
            schema={element.schema}
            parentConfig={element.parentConfig}
            config={element.config}
            path={[...props.path, element.key]}
            restartPendingFor={props.restartPendingFor}
            loadedEnvironmentVariables={props.loadedEnvironmentVariables}
            advancedMode={props.advancedMode}
            performAction={props.performAction}
            updateField={props.updateField}
            renderHeader={props.renderHeader}
            configHasChanged={props.configHasChanged}
          />
        ))}

        {(autoButtons.length > 0 || topButtons.length > 0 || bottomButtons.length > 0) && (
          <>
            <div className="border-b border-panel-border" />

            <div className="flex justify-end gap-x-3 font-semibold">
              {[...autoButtons, ...topButtons, ...bottomButtons]}
            </div>
          </>
        )}
      </fieldset>
    );
  }

  return (
    <>
      {elements.map((element, index) => (
        <AnySchema
          // eslint-disable-next-line react/no-array-index-key
          key={`${element.key}-${index}`}
          rootSchema={props.rootSchema}
          schema={element.schema}
          parentConfig={element.parentConfig}
          config={element.config}
          path={[...props.path, element.key]}
          restartPendingFor={props.restartPendingFor}
          loadedEnvironmentVariables={props.loadedEnvironmentVariables}
          advancedMode={props.advancedMode}
          performAction={props.performAction}
          updateField={props.updateField}
          renderHeader={props.renderHeader}
          configHasChanged={props.configHasChanged}
        />
      ))}

      {(autoButtons.length > 0 || topButtons.length > 0 || bottomButtons.length > 0) && (
        <>
          <div className="border-b border-panel-border" />

          <div className="flex justify-end gap-x-3 font-semibold">
            {[...autoButtons, ...topButtons, ...bottomButtons]}
          </div>
        </>
      )}
    </>
  );
}

export default FieldSetSection;
