import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import DynamicField from '@/components/Dynamic/DynamicField';
import AiringProviderList from '@/components/Settings/AiringScheduleSettings/AiringProviderList';
import { sortAiringProviders, withAiringOption, withAiringProviders } from '@/core/react-query/airing-schedule/draft';
import {
  useAiringProvidersQuery,
  useAiringScheduleConfigurationQuery,
} from '@/core/react-query/airing-schedule/queries';
import { useConfigurationQuery, useConfigurationSchemaQuery } from '@/core/react-query/configuration/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

import type { FormSchemaType } from '@/core/types/api/configuration';

const loadError = <div className="m-auto font-semibold text-panel-text-danger">Failed to load the settings.</div>;

const loading = <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;

/** The plain members the schema shows; the lists and records have editors of their own, or none. */
const getOptionKeys = (schema: FormSchemaType) =>
  Object.keys(schema['x-uiDefinition'].structure ?? {}).filter((key) => {
    const definition = schema.properties[key]?.['x-uiDefinition'];
    return definition?.elementType === 'auto' && (definition.visibility?.default ?? 'visible') === 'visible';
  });

const AiringScheduleSettingsContent = ({ configurationId }: { configurationId: string }) => {
  const { airingScheduleDraft: draft, setAiringScheduleDraft: setDraft } = useSettingsContext();
  const providersQuery = useAiringProvidersQuery();
  const configQuery = useConfigurationQuery(configurationId);
  const schemaQuery = useConfigurationSchemaQuery(configurationId);

  if (providersQuery.isError || configQuery.isError || schemaQuery.isError) return loadError;
  if (providersQuery.isPending || configQuery.isPending || schemaQuery.isPending) return loading;

  const serverProviders = sortAiringProviders(providersQuery.data);
  const providers = draft.providers ?? serverProviders;
  const serverOptions = configQuery.data;
  const options = { ...serverOptions, ...draft.options };
  const schema = schemaQuery.data;

  return (
    <>
      <title>Settings &gt; Airing Schedule | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Airing Schedule</div>
        <div>
          Choose the providers Shoko gets broadcast and streaming times from. A provider is active while any of its
          kinds is on. Everything here waits for Save at the bottom of the page, except a provider&apos;s own settings,
          which are saved with their own button.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {providers.length === 0
        ? <div className="opacity-65">No airing schedule provider is installed.</div>
        : (
          <AiringProviderList
            providers={providers}
            onChange={value => setDraft(withAiringProviders(draft, serverProviders, value))}
          />
        )}

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="font-semibold">General Options</div>
        {getOptionKeys(schema).map(key => (
          <div className="flex flex-col gap-y-1" key={key}>
            <DynamicField
              onChange={value => setDraft(withAiringOption(draft, serverOptions, key, value))}
              propertyName={key}
              propertySchema={schema.properties[key]}
              value={options[key]}
            />
            {schema.properties[key].description && (
              <div className="text-sm opacity-65">{schema.properties[key].description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

const AiringScheduleSettings = () => {
  const configurationQuery = useAiringScheduleConfigurationQuery();
  if (configurationQuery.isError) return loadError;
  if (!configurationQuery.data) return loading;
  return <AiringScheduleSettingsContent configurationId={configurationQuery.data.ID} />;
};

export default AiringScheduleSettings;
