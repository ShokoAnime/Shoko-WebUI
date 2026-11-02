import { useParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isEqual } from 'lodash';

import DynamicForm from '@/components/Dynamic/DynamicForm';
import Button from '@/components/Input/Button';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import { useUpdateConfigurationMutation } from '@/core/react-query/configuration/mutations';
import { useConfigurationQuery } from '@/core/react-query/configuration/queries';
import { usePluginsQuery } from '@/core/react-query/plugin/queries';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';

const toDraft = (data: Record<string, unknown> | undefined) => data ?? {};

const PluginConfigurationSettings = () => {
  const { configId: configurationId = '' } = useParams();

  const pluginsQuery = usePluginsQuery({});
  const plugin = pluginsQuery.data?.find(item => item.Configuration?.ID === configurationId);
  const configuration = plugin?.Configuration;
  const title = plugin ? `${plugin.Name} Settings` : 'Plugin Settings';

  const configQuery = useConfigurationQuery(configurationId, configurationId !== '');
  const [draft, setDraft] = useSyncedState(configQuery.data, toDraft);
  const isEdited = configQuery.isSuccess && !isEqual(configQuery.data, draft);

  const { isPending, mutate: saveConfiguration } = useUpdateConfigurationMutation(configurationId);

  const handleSave = () => {
    saveConfiguration(draft, {
      onSuccess: (result) => {
        const errors = Object.values(result.ValidationErrors ?? {}).flat();
        if (errors.length > 0) {
          toast.error(`${title} were not saved!`, errors.join(' '));
          return;
        }
        toast.success(`${title} saved!`);
      },
    });
  };

  return (
    <>
      <SettingsHeader title={title}>
        {configuration?.Description ?? 'Saved with the button below, not with the core settings.'}
      </SettingsHeader>

      <div className="border-b border-panel-border" />

      {configuration && configuration.RestartPendingFor.length > 0 && (
        <div className="text-sm text-panel-text-warning">
          {`A restart is needed for ${configuration.RestartPendingFor.join(', ')} to take effect.`}
        </div>
      )}
      {configQuery.isPending && (
        <div className="flex justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={3} spin />
        </div>
      )}
      {configQuery.isError && <div className="text-panel-text-danger">Failed to load the settings.</div>}
      {configQuery.isSuccess && (
        <>
          <DynamicForm
            configuration={draft}
            configurationId={configurationId}
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
              Save
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default PluginConfigurationSettings;
