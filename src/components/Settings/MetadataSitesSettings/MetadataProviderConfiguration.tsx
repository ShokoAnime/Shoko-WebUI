import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { isEqual } from 'lodash';
import { useToggle } from 'usehooks-ts';

import DynamicForm from '@/components/Dynamic/DynamicForm';
import Button from '@/components/Input/Button';
import { useUpdateConfigurationMutation } from '@/core/react-query/configuration/mutations';
import { useConfigurationQuery } from '@/core/react-query/configuration/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';

import type { ConfigurationInfoType } from '@/core/types/api/configuration';

type Props = {
  configuration: ConfigurationInfoType;
  providerName: string;
};

const toDraft = (data: Record<string, unknown> | undefined) => data ?? {};

/**
 * A provider's own configuration, collapsed until opened and loaded only then. It is saved through
 * `PUT Configuration/{id}` with its own button, apart from the page's Save.
 */
const MetadataProviderConfiguration = ({ configuration, providerName }: Props) => {
  const [open, toggleOpen] = useToggle(false);

  const configQuery = useConfigurationQuery(configuration.ID, open);
  const [draft, setDraft] = useSyncedState(configQuery.data, toDraft);
  const isEdited = configQuery.isSuccess && !isEqual(configQuery.data, draft);

  const { isPending, mutate: saveConfiguration } = useUpdateConfigurationMutation(configuration.ID);

  const handleSave = () => {
    saveConfiguration(draft, {
      onSuccess: (result) => {
        const errors = Object.values(result.ValidationErrors ?? {}).flat();
        if (errors.length > 0) {
          toast.error(`${providerName} settings were not saved!`, errors.join(' '));
          return;
        }
        toast.success(`${providerName} settings saved!`);
        // Whether the provider is configured may follow from its settings.
        invalidateQueries(['metadata', 'provider']);
        invalidateQueries(['metadata', 'source']);
      },
    });
  };

  return (
    <div className="flex flex-col rounded-lg border border-panel-border bg-panel-input">
      <button
        type="button"
        className="flex items-center justify-between px-4 py-2 text-left"
        onClick={toggleOpen}
        aria-expanded={open}
      >
        <span className="flex items-center gap-x-1">
          {`${providerName} Settings`}
          <span className="text-xs opacity-65">{configuration.Plugin.Name}</span>
        </span>
        <Icon path={mdiChevronDown} size={1} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimateHeight height={open ? 'auto' : 0}>
        <div className="flex flex-col gap-y-4 border-t border-panel-border p-4">
          <div className="text-sm opacity-65">
            Kept in the provider&apos;s own configuration and saved with the button below, not with the page&apos;s
            Save.
          </div>
          {configuration.RestartPendingFor.length > 0 && (
            <div className="text-sm text-panel-text-warning">
              {`A restart is needed for ${configuration.RestartPendingFor.join(', ')} to take effect.`}
            </div>
          )}
          {configQuery.isPending && (
            <div className="flex justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={2} spin />
            </div>
          )}
          {configQuery.isError && <div className="text-panel-text-danger">Failed to load the settings.</div>}
          {configQuery.isSuccess && (
            <>
              <DynamicForm
                configuration={draft}
                configurationId={configuration.ID}
                setConfiguration={setDraft}
                hideHeader
              />
              <div className="flex justify-end gap-x-3 font-semibold">
                <Button
                  buttonType="secondary"
                  buttonSize="normal"
                  onClick={() => setDraft(toDraft(configQuery.data))}
                  disabled={!isEdited || isPending}
                >
                  Discard
                </Button>
                <Button
                  buttonType="primary"
                  buttonSize="normal"
                  onClick={handleSave}
                  disabled={!isEdited || isPending}
                  loading={isPending}
                >
                  {`Save ${providerName} Settings`}
                </Button>
              </div>
            </>
          )}
        </div>
      </AnimateHeight>
    </div>
  );
};

export default MetadataProviderConfiguration;
