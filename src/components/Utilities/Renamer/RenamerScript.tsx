import React, { Suspense, lazy } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { findKey } from 'lodash';

import { useConfigurationSchemaQuery } from '@/core/react-query/configuration/queries';

import type { Updater } from 'use-immer';

const CodeEditor = lazy(
  () => import('@/components/Dynamic/CodeEditor'),
);

type Props = {
  newConfig: Record<string, unknown>;
  setNewConfig: Updater<Record<string, unknown>>;
  configurationId: string;
};

const RenamerScript = ({ configurationId, newConfig, setNewConfig }: Props) => {
  const schemaQuery = useConfigurationSchemaQuery(configurationId);

  if (schemaQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={3} />
      </div>
    );
  }

  if (!schemaQuery.data) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-important">
        Failed to load configuration schema.
      </div>
    );
  }

  const configurationProperties = schemaQuery.data.properties;

  const propertyName = findKey(
    configurationProperties,
    property => property['x-uiDefinition']?.elementType === 'code-block',
  );

  const updateScript = (value?: string) => {
    setNewConfig((draftState) => {
      if (!propertyName) return;
      draftState[propertyName] = value ?? '';
    });
  };

  if (!propertyName) {
    return (
      <div className="flex size-full grow flex-col items-center justify-center gap-y-2 text-center">
        This renamer does not have any script to edit!
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} spin size={3} />
        </div>
      }
    >
      <CodeEditor
        language={configurationProperties[propertyName]['x-uiDefinition']?.codeLanguage?.toLowerCase() ?? 'plaintext'}
        value={newConfig[propertyName] as string}
        onChange={updateScript}
      />
    </Suspense>
  );
};

export default RenamerScript;
