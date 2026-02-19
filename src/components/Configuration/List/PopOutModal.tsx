import React, { useLayoutEffect, useMemo, useState } from 'react';
import { applyPatch } from 'fast-json-patch';
import { cloneDeep, get, set, unset } from 'lodash';

import AnySectionContainer from '@/components/Configuration/SectionContainer/AnySectionContainer';
import { getPrimaryKey } from '@/components/Configuration/hooks/useListSections';
import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { usePerformConfigurationActionMutation } from '@/core/react-query/configuration/mutations';
import {
  assertIsNullable,
  createDefaultItemForSchema,
  pathToString,
  resolveListReference,
  resolveReference,
  validate,
} from '@/core/schema';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type {
  ComplexListConfigurationUiDefinitionType,
  JSONSchema4WithUiDefinition,
  SectionsConfigurationUiDefinitionType,
} from '@/core/react-query/configuration/types';

export type PopOutModalProps = {
  onClose: () => void;
  setValue: (value: unknown, index?: number) => void;
  show: boolean;
  title: string;
  path: (string | number)[];
  rootConfig: unknown;
  index?: number | null | undefined;
  serverControlled: boolean;
  parentSchema: JSONSchema4WithUiDefinition;
  rootSchema: JSONSchema4WithUiDefinition;
  modes: { advanced: boolean, debug: boolean };
};

type State = {
  shown: false;
  index: number | null | undefined;
  path: (string | number)[];
  config?: unknown;
  parentConfig?: unknown[];
  rootConfig?: unknown;
} | {
  shown: true;
  index: number | null | undefined;
  path: (string | number)[];
  config: unknown;
  parentConfig: unknown[] | undefined;
  rootConfig: unknown;
};

function PopOutModal({ show, ...props }: PopOutModalProps) {
  const navigate = useNavigateVoid();
  const { itemSchema, listDefinition } = useMemo(() => {
    const schema0 = resolveReference(props.rootSchema, props.parentSchema);
    const schema1 = resolveListReference(props.rootSchema, schema0);
    return {
      itemDefinition: schema1['x-uiDefinition'] as SectionsConfigurationUiDefinitionType,
      itemSchema: schema1,
      listDefinition: schema0['x-uiDefinition'] as ComplexListConfigurationUiDefinitionType,
      listSchema: schema0,
    };
  }, [props.rootSchema, props.parentSchema]);
  const { mutate: performActionRemote } = usePerformConfigurationActionMutation(props.rootSchema.id!);
  const [state, setState] = useState<State>(() => ({ shown: false, path: [], index: undefined }));
  const isValid = useMemo(() => !state.shown || validate(props.rootSchema, itemSchema, state.config), [
    state.shown,
    state.config,
    props.rootSchema,
    itemSchema,
  ]);
  const { category, title } = useMemo(
    () =>
      getPrimaryKey(
        state.config === undefined ? props.title : (state.config as Record<string, unknown>)[listDefinition.primaryKey],
        false,
      ),
    [state.config, props.title, listDefinition.primaryKey],
  );
  const setConfig = useEventCallback((rootConfig: unknown) => {
    const parentConfig = get(rootConfig, props.path) as unknown[];
    const config = get(rootConfig, state.path) as unknown;
    setState(prevState => ({ ...prevState, config, parentConfig, rootConfig }));
  });

  const performCustomAction = useEventCallback((path: (string | number)[], actionName: string) => {
    performActionRemote({ config: state.rootConfig, path: pathToString(path), actionName }, {
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
          const newConfig = cloneDeep(state.rootConfig);
          applyPatch(newConfig, data.PatchOperations);
          setConfig(newConfig);
        }
        if (data.ShowSaveMessage) {
          props.setValue(state.config, state.path[state.path.length - 1] as number);
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
            setConfig(newerConfig);
          } else {
            setConfig(newConfig);
          }
          if (data.ShowSaveMessage) {
            props.setValue(state.config);
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
      if (rootSchema !== props.rootSchema) return;

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
          const currentValue = get(state.rootConfig, path) as boolean | undefined | null;
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

      let newConfig = cloneDeep(state.rootConfig);
      if (path.length === 0) {
        newConfig = configValue;
      } else if (configValue === undefined) {
        unset(newConfig as Record<string, unknown>, path);
      } else {
        set(newConfig as Record<string, unknown>, path, configValue);
      }
      if (props.serverControlled) {
        performReactiveAction(newConfig, path);
      } else {
        setConfig(newConfig);
      }
    },
  );

  const handleClose = useEventCallback(() => {
    setState(prevState => ({ ...prevState, shown: false, path: [] }));
    props.onClose();
  });

  const handleSave = useEventCallback(() => {
    setState({ shown: false, path: [], index: undefined });
    props.setValue(state.config, state.index ?? undefined);
    props.onClose();
  });

  useLayoutEffect(() => {
    if (!show) {
      if (state.shown) {
        setState(prevState => ({ ...prevState, shown: false, path: [] }));
        props.onClose();
      }
      return;
    }

    if (props.index !== undefined && props.index === state.index && state.rootConfig && state.parentConfig && state.config) {
      if (!state.shown) {
        const { config, parentConfig, rootConfig } = state;
        setState({ shown: true, path: [...props.path, parentConfig.length - 1], index: props.index, rootConfig, parentConfig, config });
      }
      return;
    }

    if (props.index === undefined) {
      if (state.shown) {
        setState(prevState => ({ ...prevState, shown: false, path: [] }));
        props.onClose();
      }
      return;
    }

    const rootConfig = cloneDeep(props.rootConfig);
    const parentConfig = get(rootConfig, props.path) as unknown[];
    if (props.index === null) {
      const path = [...props.path, parentConfig.length];
      const config = createDefaultItemForSchema(props.rootSchema, itemSchema, listDefinition, path, true);
      parentConfig.push(config);
      if (props.serverControlled) {
        setState({ shown: true, index: null, path, rootConfig, config, parentConfig: undefined });
        performReactiveAction(rootConfig, path);
      } else {
        setState({ shown: true, index: null, path, rootConfig, config, parentConfig });
      }
      return;
    }

    const { index } = props;
    const config = parentConfig[index];
    if (config === undefined) {
      setState(prevState => ({ ...prevState, shown: false, path: [], index: undefined }));
      props.onClose();
      return;
    }

    const path = [...props.path, index];
    if (props.serverControlled) {
      setState({ shown: true, index, path, rootConfig, config, parentConfig: undefined });
      performReactiveAction(rootConfig, path);
    } else {
      setState({ shown: true, index, path, rootConfig, config, parentConfig });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rootSchema, props.rootConfig, props.path, props.index, show]);

  return (
    <ModalPanel
      show={state.shown && show}
      onRequestClose={handleClose}
      header={title}
      subHeader={category}
    >
      {state.config !== undefined && (
        <AnySectionContainer
          rootConfig={state.rootConfig}
          parentSchema={props.parentSchema}
          rootSchema={props.rootSchema}
          schema={itemSchema}
          parentConfig={state.parentConfig}
          config={state.config}
          path={state.path}
          restartPendingFor={[]}
          loadedEnvironmentVariables={[]}
          serverControlled={props.serverControlled}
          modes={props.modes}
          updateField={updateField}
          renderHeader={false}
          performAction={performCustomAction}
          configHasChanged
        />
      )}

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2">
          Cancel
        </Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={!isValid}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default PopOutModal;
