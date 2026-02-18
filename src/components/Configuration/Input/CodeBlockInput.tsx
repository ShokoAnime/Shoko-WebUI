/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { Suspense, lazy, useMemo } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import useBadges from '@/components/Configuration/hooks/useBadges';
import useVisibility from '@/components/Configuration/hooks/useVisibility';
import { useReference } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type { AnySchemaProps } from '@/components/Configuration/AnySchema';
import type { CodeEditorConfigurationUiDefinitionType } from '@/core/react-query/configuration/types';
import type { OnChange } from '@monaco-editor/react';

const RenamerEditor = lazy(
  () => import('@/components/Utilities/Renamer/RenamerEditor'),
);

function CodeBlockInput(props: AnySchemaProps): React.JSX.Element | null {
  const { schema } = props;
  const resolvedSchema = useReference(props.rootSchema, schema);
  const visibility = useVisibility(
    resolvedSchema,
    props.parentConfig,
    props.modes,
    props.loadedEnvironmentVariables,
  );
  const badges = useBadges(resolvedSchema, props.path, props.loadedEnvironmentVariables, props.restartPendingFor);
  const isDisabled = visibility === 'disabled';
  const isReadOnly = visibility === 'read-only';
  const uiDefinition = resolvedSchema['x-uiDefinition'] as CodeEditorConfigurationUiDefinitionType;
  const size = useMemo(() => {
    if (uiDefinition.elementSize === 'full') {
      return 'h-192';
    }
    if (uiDefinition.elementSize === 'large') {
      return 'h-128';
    }
    if (uiDefinition.elementSize === 'small') {
      return 'h-48';
    }
    return 'h-96';
  }, [uiDefinition]);

  // TODO: IMPROVE THE AUTO FORMATTING CAPABILITIES OF THIS THING.

  const handleChange: OnChange = useEventCallback((value, _context) => {
    if (uiDefinition.codeAutoFormatOnLoad && uiDefinition.codeLanguage === 'Json') {
      try {
        const formattedValue = JSON.stringify(JSON.parse(value ?? ''));
        props.updateField(props.path, formattedValue, props.schema, props.rootSchema);
        return;
      } catch { /**/ }
    }

    props.updateField(props.path, value ?? '', props.schema, props.rootSchema);
  });

  const defaultValue = useMemo(() => {
    if (uiDefinition.codeAutoFormatOnLoad && uiDefinition.codeLanguage === 'Json') {
      try {
        return JSON.stringify(JSON.parse((props.config as string | null) ?? ''), undefined, 2);
      } catch { /**/ }
    }
    return (props.config as string | null) ?? '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiDefinition]);

  return (
    <div>
      <div
        className={cx(
          'flex justify-between transition-opacity flex-col',
          isDisabled && 'opacity-65',
        )}
      >
        <span className="flex gap-x-1.5">
          {props.schema.title}
          {isReadOnly && <span className="self-center text-xs opacity-65">(Read-Only)</span>}
          {badges}
        </span>
        <div
          className={cx(
            'w-full flex overflow-hidden rounded-md border border-panel-border',
            size,
            'bg-panel-background',
          )}
        >
          <Suspense
            fallback={
              <div className="flex grow items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} spin size={3} />
              </div>
            }
          >
            <RenamerEditor
              className="overflow-hidden rounded-md"
              options={{
                scrollBeyondLastLine: false,
              }}
              language={uiDefinition.codeLanguage.toLowerCase()}
              defaultValue={defaultValue}
              onChange={handleChange}
            />
          </Suspense>
        </div>
      </div>
      <div className="mt-1 text-sm text-panel-text opacity-65">{props.schema.description}</div>
    </div>
  );
}

export default CodeBlockInput;
