import React, { useEffect, useMemo, useRef, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { isEqual } from 'lodash';

import ControlledConfigurationWithSchema from '@/components/Configuration/ControlledConfigurationWithSchema';
import { useSaveConfigurationMutation } from '@/core/react-query/configuration/mutations';
import { useConfigurationJsonSchemaQuery } from '@/core/react-query/configuration/queries';

import type { JSONSchema4WithUiDefinition } from '@/core/react-query/configuration/types';

type DynamicConfigurationProps = {
  configGuid: string | undefined | null;
  setTitle?: boolean;
  onSave?: () => void;
};

function DynamicConfiguration(props: DynamicConfigurationProps): React.JSX.Element {
  const { configGuid, onSave, setTitle } = props;
  const schemaQuery = useConfigurationJsonSchemaQuery(configGuid!, configGuid != null);
  const { mutate: saveRemote } = useSaveConfigurationMutation(configGuid!);
  const { config, info, schema } = schemaQuery.data ?? {};
  const [configState, setConfigState] = useState(config);
  const refSchema = useRef<JSONSchema4WithUiDefinition | undefined>(schema);
  const hasChanged = useMemo(() => !isEqual(config, configState), [config, configState]);

  useEffect(() => {
    setConfigState(config);
    refSchema.current = schema;
  }, [config, schema]);

  if (!schema || !info || refSchema.current !== schema || !config || !configState || !configGuid) {
    return (
      <div className="flex grow items-center justify-center">
        <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />
      </div>
    );
  }

  return (
    <ControlledConfigurationWithSchema
      schema={schema}
      info={info}
      config={configState}
      hasChanged={hasChanged}
      configGuid={configGuid}
      setTitle={setTitle}
      save={saveRemote}
      setConfig={setConfigState}
      onSave={onSave}
    />
  );
}

export default DynamicConfiguration;
