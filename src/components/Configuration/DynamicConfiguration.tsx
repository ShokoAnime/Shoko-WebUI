import React, { useEffect, useMemo, useRef, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { cloneDeep, get, isEqual, set, unset } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import AnySchema from '@/components/Configuration/AnySchema';
import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import {
  usePerformConfigurationActionMutation,
  useSaveConfigurationActionMutation,
} from '@/core/react-query/configuration/mutations';
import { useConfigurationJsonSchemaQuery } from '@/core/react-query/configuration/queries';
import { assertIsNullable, pathToString } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';

import type {
  JSONSchema4WithUiDefinition,
  SectionsConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';

type DynamicConfigurationProps = {
  configGuid: string | undefined;
  setTitle?: boolean;
};

function DynamicConfiguration(props: DynamicConfigurationProps): React.JSX.Element {
  const { configGuid, setTitle } = props;
  const schemaQuery = useConfigurationJsonSchemaQuery(configGuid!, Boolean(configGuid));
  const { config, info, schema } = schemaQuery.data ?? {};
  if (!schema || !info || !config || !configGuid) {
    return (
      <div className="flex grow items-center justify-center">
        <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />
      </div>
    );
  }

  return (
    <InternalPageWithSchemaAndConfig
      schema={schema}
      info={info}
      config={config}
      configGuid={configGuid}
      setTitle={setTitle}
    />
  );
}

export default DynamicConfiguration;

type InternalPageWithSchemaAndConfigProps = {
  schema: JSONSchema4WithUiDefinition;
  info: ConfigurationInfoType;
  config: unknown;
  configGuid: string;
  setTitle?: boolean;
};

function InternalPageWithSchemaAndConfig(props: InternalPageWithSchemaAndConfigProps): React.JSX.Element {
  const [[schema, config], setSchemaAndConfig] = useState<[JSONSchema4WithUiDefinition, unknown]>(
    () => [props.schema, cloneDeep(props.config)],
  );
  const { mutate: defaultSaveRemote } = useSaveConfigurationActionMutation(props.configGuid);
  const { mutate: performActionRemote } = usePerformConfigurationActionMutation(props.configGuid);
  const hasChanged = useMemo(() => !isEqual(config, props.config), [config, props.config]);
  const toastId = useRef<number | string>(undefined);

  const updateField = useEventCallback(
    (
      path: string[],
      value: unknown,
      valueSchema: JSONSchema4WithUiDefinition,
      rootSchema: JSONSchema4WithUiDefinition,
    ) => {
      if (rootSchema !== schema) return;

      let configValue = value;
      const type = valueSchema.type instanceof Array
        ? valueSchema.type.find(typ => typ !== 'null') ?? 'null'
        : valueSchema.type ?? 'null';
      if (
        (type === 'string' || type === 'number' || type === 'boolean' || type === 'integer')
        && assertIsNullable(valueSchema) && value === ''
      ) {
        configValue = null;
      }
      if (type === 'boolean') {
        const defaultValue = valueSchema.default ?? false as boolean;
        if (value === defaultValue) {
          const currentValue = get(props.config, path) as boolean | undefined | null;
          if (currentValue === undefined || currentValue === null) {
            configValue = currentValue;
          }
        }
      }
      if ((type === 'integer' || type === 'number') && typeof value === 'string') {
        configValue = type === 'integer' ? parseInt(value, 10) : parseFloat(value);
        if (Number.isNaN(value)) {
          return;
        }
      }

      let newConfig = cloneDeep(config);
      if (path.length === 0) {
        newConfig = configValue;
      } else if (configValue === undefined) {
        unset(newConfig as Record<string, unknown>, path);
      } else {
        set(newConfig as Record<string, unknown>, path, configValue);
      }
      setSchemaAndConfig([schema, newConfig]);
    },
  );

  const performAction = useEventCallback((path: (string | number)[], action: string) => {
    performActionRemote({ config, path: pathToString(path), action }, {
      onError(error) {
        toast.error(`Failed to perform action "${action}" on ${JSON.stringify(path)}: ${error.message}`);
      },
      onSuccess(data) {
        if (data.ShowDefaultSaveMessage) {
          toast.success(`Successfully saved configuration for "${schema.title}"`);
        }
        for (const { Message: message } of data.Messages) {
          toast.info(message);
        }
      },
    });
  });

  const defaultSave = useEventCallback(() => {
    if (!hasChanged) return;

    defaultSaveRemote(config, {
      onError(error) {
        toast.error(`Failed to save: ${error.message}`);
      },
      onSuccess() {
        toast.success(`Successfully saved configuration for "${schema.title}"`);
      },
    });
  });

  const [debouncedUnsavedChanges] = useDebounceValue(hasChanged, 100);

  // Use debounced value for unsaved changes to avoid flashing the toast for certain changes
  useEffect(() => {
    if (!debouncedUnsavedChanges) {
      if (toastId.current) toast.dismiss(toastId.current);
      return;
    }

    toastId.current = toast.info(
      `Unsaved Changes for "${props.schema.title}"`,
      'Please save before leaving this page.',
      { autoClose: false, position: 'top-right' },
    );
  }, [debouncedUnsavedChanges, props.schema.title]);

  useEffect(() => () => {
    if (toastId.current) toast.dismiss(toastId.current);
  }, []);

  useEffect(() => {
    if (toastId.current) toast.dismiss(toastId.current);
    toastId.current = undefined;
    setSchemaAndConfig([props.schema, cloneDeep(props.config)]);
  }, [props.config, props.schema]);

  const hideButtons =
    (schema['x-uiDefinition'] as Partial<SectionsConfigurationUiDefinitionType> | undefined)?.actions?.hideSaveAction
      ?? false;

  return (
    <>
      {props.setTitle && <title>{`Settings > Plugin > ${schema.title} | Shoko`}</title>}
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">{schema.title}</div>
        <div>
          {schema.description ?? 'No description provided.'}
        </div>
      </div>
      <AnySchema
        rootSchema={schema}
        schema={schema}
        parentConfig={config}
        config={config}
        path={[]}
        restartPendingFor={props.info.RestartPendingFor}
        loadedEnvironmentVariables={props.info.LoadedEnvironmentVariables}
        advancedMode
        performAction={performAction}
        updateField={updateField}
        renderHeader={false}
        configHasChanged={hasChanged}
      />

      {!hideButtons && (
        <>
          <div className="border-b border-panel-border" />

          <div className="flex justify-end gap-x-3 font-semibold">
            <Button
              disabled={!hasChanged}
              onClick={defaultSave}
              buttonType="primary"
              buttonSize="normal"
            >
              Save
            </Button>
          </div>
        </>
      )}
    </>
  );
}
