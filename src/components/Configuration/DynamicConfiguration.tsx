import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { mdiLoading } from '@mdi/js';
import Icon from '@mdi/react';
import { applyPatch } from 'fast-json-patch';
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
import useNavigate from '@/hooks/useNavigateVoid';

import type {
  JSONSchema4WithUiDefinition,
  SectionsConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';
import type { RootState } from '@/core/store';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';

type DynamicConfigurationProps = {
  configGuid: string | undefined | null;
  setTitle?: boolean;
  onSave?: () => void;
};

function DynamicConfiguration(props: DynamicConfigurationProps): React.JSX.Element {
  const { configGuid, onSave, setTitle } = props;
  const schemaQuery = useConfigurationJsonSchemaQuery(configGuid!, configGuid != null);
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
      onSave={onSave}
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
  onSave?: () => void;
};

function InternalPageWithSchemaAndConfig(props: InternalPageWithSchemaAndConfigProps): React.JSX.Element {
  const [[schema, config], setSchemaAndConfig] = useState<[JSONSchema4WithUiDefinition, unknown]>(
    () => [props.schema, cloneDeep(props.config)],
  );
  const navigate = useNavigate();
  const { mutate: defaultSaveRemote } = useSaveConfigurationActionMutation(props.configGuid);
  const { mutate: performActionRemote } = usePerformConfigurationActionMutation(props.configGuid);
  const showAdvancedSettings = useSelector((state: RootState) => state.misc.advancedMode);
  const hasChanged = useMemo(() => !isEqual(config, props.config), [config, props.config]);
  const toastId = useRef<number | string>(undefined);

  const performCustomAction = useEventCallback((path: (string | number)[], actionName: string) => {
    performActionRemote({ config, path: pathToString(path), actionName }, {
      onError(error) {
        toast.error(`Failed to perform custom action "${actionName}" on ${JSON.stringify(path)}: ${error.message}`);
      },
      onSuccess(data) {
        if (data.Redirect) {
          if (data.Redirect.Location.startsWith('http://') || data.Redirect.Location.startsWith('https://')) {
            if (!data.Redirect.OpenInNewTab) {
              window.open(data.Redirect.Location, '_self', 'noopener,noreferrer');
              // Return early because we can't show the toasts if we're opening
              // the URL in the current window.
              return;
            }

            window.open(data.Redirect.Location, '_blank', 'noopener,noreferrer');
          } else if (data.Redirect.OpenInNewTab) {
            try {
              const url = new URL(data.Redirect.Location, window.location.href);
              window.open(url.href, '_blank', 'noopener,noreferrer');
            } catch (error) {
              toast.error(`Failed to open "${data.Redirect.Location}"!}`);
              console.error(
                error,
                `Failed to open "${data.Redirect.Location}": ${error instanceof Error ? error.message : error}`,
              );
            }
          } else {
            navigate(data.Redirect.Location);
          }
        }

        if (data.PatchOperations && data.PatchOperations.length > 0) {
          const newConfig = cloneDeep(config);
          applyPatch(newConfig, data.PatchOperations);
          setSchemaAndConfig([schema, newConfig]);
        }
        if (data.ShowSaveMessage) {
          toast.success(`Successfully saved configuration for "${schema.title}"`);
          if (props.onSave) props.onSave();
        }
        for (const { Message: message } of data.Messages) {
          toast.info(message);
        }
      },
    });
  });

  const performReactiveAction = useEventCallback(
    (newConfig: unknown, path: (string | number)[], actionType: 'Saved' | 'Loaded' | 'Changed') => {
      performActionRemote({ config: newConfig, path: pathToString(path), actionType }, {
        onError(error) {
          toast.error(`Failed to perform reactive action "${actionType}" on ${JSON.stringify(path)}: ${error.message}`);
        },
        onSuccess(data) {
          if (data.Redirect) {
            if (data.Redirect.Location.startsWith('http://') || data.Redirect.Location.startsWith('https://')) {
              if (!data.Redirect.OpenInNewTab) {
                window.open(data.Redirect.Location, '_self', 'noopener,noreferrer');
                // Return early because we can't show the toasts if we're opening
                // the URL in the current window.
                return;
              }

              window.open(data.Redirect.Location, '_blank', 'noopener,noreferrer');
            } else if (data.Redirect.OpenInNewTab) {
              try {
                const url = new URL(data.Redirect.Location, window.location.href);
                window.open(url.href, '_blank', 'noopener,noreferrer');
              } catch (error) {
                toast.error(`Failed to open "${data.Redirect.Location}"!}`);
                console.error(
                  error,
                  `Failed to open "${data.Redirect.Location}": ${error instanceof Error ? error.message : error}`,
                );
              }
            } else {
              navigate(data.Redirect.Location);
            }
          }

          if (data.PatchOperations && data.PatchOperations.length > 0) {
            const newerConfig = cloneDeep(newConfig);
            applyPatch(newerConfig, data.PatchOperations);
            setSchemaAndConfig([schema, newerConfig]);
          }
          if (data.ShowSaveMessage) {
            toast.success(`Successfully saved configuration for "${schema.title}"`);
            if (props.onSave) props.onSave();
          }
          for (const { Message: message } of data.Messages) {
            toast.info(message);
          }
        },
      });
    },
  );

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
      if (props.info.HasReactiveActions) {
        performReactiveAction(newConfig, path, 'Changed');
      }
    },
  );

  const defaultSave = useEventCallback(() => {
    if (!hasChanged) return;

    if (props.info.HasReactiveActions) {
      performReactiveAction(config, [], 'Saved');
    } else {
      defaultSaveRemote(config, {
        onError(error) {
          toast.error(`Failed to save: ${error.message}`);
        },
        onSuccess() {
          toast.success(`Successfully saved configuration for "${schema.title}"`);
          if (props.onSave) props.onSave();
        },
      });
    }
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

  useEffect(() => {
    if (props.info.HasReactiveActions) {
      performReactiveAction(props.config, [], 'Loaded');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.info.HasReactiveActions, props.configGuid]);

  const hideButtons =
    (schema['x-uiDefinition'] as Partial<SectionsConfigurationUiDefinitionType> | undefined)?.actions?.hideSaveAction
      ?? false;

  return (
    <>
      {props.setTitle && (
        <>
          <title>{`Settings > Plugin > ${schema.title} | Shoko`}</title>
          <div className="flex flex-col gap-y-1">
            <div className="text-xl font-semibold">{schema.title}</div>
            <div>
              {schema.description ?? 'No description provided.'}
            </div>
          </div>
        </>
      )}

      <AnySchema
        rootSchema={schema}
        schema={schema}
        parentConfig={config}
        config={config}
        path={[]}
        restartPendingFor={props.info.RestartPendingFor}
        loadedEnvironmentVariables={props.info.LoadedEnvironmentVariables}
        advancedMode={showAdvancedSettings}
        performAction={performCustomAction}
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
