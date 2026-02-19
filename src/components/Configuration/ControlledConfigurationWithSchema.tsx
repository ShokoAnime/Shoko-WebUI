import React, { useEffect, useRef } from 'react';
import { applyPatch } from 'fast-json-patch';
import { cloneDeep, get, set, unset } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import AnySchema from '@/components/Configuration/AnySchema';
import toast from '@/components/Toast';
import { usePerformConfigurationActionMutation } from '@/core/react-query/configuration/mutations';
import { assertIsNullable, pathToString } from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigate from '@/hooks/useNavigateVoid';

import type {
  ConfigurationActionResultType,
  JSONSchema4WithUiDefinition,
} from '@/core/react-query/configuration/types';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type { UseMutateFunction } from '@tanstack/react-query';

export type ControlledConfigurationWithSchemaProps = {
  schema: JSONSchema4WithUiDefinition;
  info: ConfigurationInfoType;
  config: unknown;
  hasChanged: boolean;
  configGuid: string;
  setTitle?: boolean;
  baseConfig?: boolean;
  save: UseMutateFunction<ConfigurationActionResultType, Error, unknown, unknown>;
  setConfig: (config: unknown) => void;
  onSave?: () => void;
};

const StaticModes = {
  advanced: true,
  debug: false,
};

const ControlledConfigurationWithSchema = (props: ControlledConfigurationWithSchemaProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { mutate: performActionRemote } = usePerformConfigurationActionMutation(props.configGuid);
  const toastId = useRef<number | string>(undefined);

  const performCustomAction = useEventCallback((path: (string | number)[], actionName: string) => {
    performActionRemote({ config: props.config, path: pathToString(path), actionName }, {
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
          const newConfig = cloneDeep(props.config);
          applyPatch(newConfig, data.PatchOperations);
          props.setConfig(newConfig);
        }
        if (data.ShowSaveMessage) {
          if (!props.baseConfig) toast.success(`Successfully saved configuration for "${props.schema.title}"`);
          if (props.onSave) props.onSave();
        }
        for (const { Message: message } of data.Messages) {
          toast.info(message);
        }
      },
    });
  });

  const performReactiveAction = useEventCallback(
    (newConfig: unknown, path: (string | number)[]) => {
      performActionRemote({ config: newConfig, path: pathToString(path), actionType: 'Changed' }, {
        onError(error) {
          toast.error(`Failed to perform reactive action on ${JSON.stringify(path)}: ${error.message}`);
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
            props.setConfig(newerConfig);
          } else {
            props.setConfig(newConfig);
          }
          if (data.ShowSaveMessage) {
            if (!props.baseConfig) toast.success(`Successfully saved configuration for "${props.schema.title}"`);
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
      if (rootSchema !== props.schema) return;

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

      let newConfig = cloneDeep(props.config);
      if (path.length === 0) {
        newConfig = configValue;
      } else if (configValue === undefined) {
        unset(newConfig as Record<string, unknown>, path);
      } else {
        set(newConfig as Record<string, unknown>, path, configValue);
      }
      if (props.info.HasLiveEdit) {
        performReactiveAction(newConfig, path);
      } else {
        props.setConfig(newConfig);
      }
    },
  );

  const defaultSave = useEventCallback(() => {
    if (!props.hasChanged) return;

    props.save(props.config, {
      onError(error) {
        toast.error(`Failed to save: ${error.message}`);
      },
      onSuccess() {
        if (!props.baseConfig) toast.success(`Successfully saved configuration for "${props.schema.title}"`);
        if (props.onSave) props.onSave();
      },
    });
  });

  const [debouncedUnsavedChanges] = useDebounceValue(props.hasChanged, 100);

  // Use debounced value for unsaved changes to avoid flashing the toast for certain changes
  useEffect(() => {
    if (!debouncedUnsavedChanges) {
      if (toastId.current) toast.dismiss(toastId.current);
      return;
    }

    // Don't show changed toast for base configurations.
    if (props.baseConfig) return;
    toastId.current = toast.info(
      `Unsaved Changes for "${props.schema.title}"`,
      'Please save before leaving this page.',
      { autoClose: false, position: 'top-right' },
    );
  }, [debouncedUnsavedChanges, props.schema.title, props.baseConfig]);

  useEffect(() => () => {
    if (toastId.current) toast.dismiss(toastId.current);
  }, []);

  useEffect(() => {
    if (toastId.current) toast.dismiss(toastId.current);
    toastId.current = undefined;
  }, [props.schema]);

  return (
    <>
      {!props.baseConfig && props.setTitle && (
        <>
          <title>{`Settings > Plugin > ${props.schema.title} | Shoko`}</title>
          <div className="flex flex-col gap-y-1">
            <div className="text-xl font-semibold">{props.schema.title}</div>
            <div>
              {props.schema.description ?? 'No description provided.'}
            </div>
          </div>
        </>
      )}

      <AnySchema
        rootSchema={props.schema}
        parentSchema={null}
        schema={props.schema}
        rootConfig={props.config}
        parentConfig={props.config}
        config={props.config}
        path={[]}
        restartPendingFor={props.info.RestartPendingFor}
        loadedEnvironmentVariables={props.info.LoadedEnvironmentVariables}
        serverControlled={props.info.HasLiveEdit}
        modes={StaticModes}
        performAction={performCustomAction}
        updateField={updateField}
        renderHeader={false}
        configHasChanged={props.hasChanged}
        defaultSave={defaultSave}
      />
    </>
  );
};

export default ControlledConfigurationWithSchema;
