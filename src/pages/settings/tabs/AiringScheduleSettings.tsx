import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { sortBy } from 'lodash';

import DynamicField from '@/components/Dynamic/DynamicField';
import AiringProviderList from '@/components/Settings/AiringScheduleSettings/AiringProviderList';
import AiringSoonRefresh from '@/components/Settings/AiringScheduleSettings/AiringSoonRefresh';
import ChannelDuplicates from '@/components/Settings/AiringScheduleSettings/ChannelDuplicates';
import ChannelVisibility from '@/components/Settings/AiringScheduleSettings/ChannelVisibility';
import PreferredChannels from '@/components/Settings/AiringScheduleSettings/PreferredChannels';
import PreferredTracks from '@/components/Settings/AiringScheduleSettings/PreferredTracks';
import SeasonDetailSources from '@/components/Settings/AiringScheduleSettings/SeasonDetailSources';
import StartSeasonOverrides from '@/components/Settings/AiringScheduleSettings/StartSeasonOverrides';
import {
  sortAiringProviders,
  withAiringScheduleDraft,
  withAiringScheduleOption,
} from '@/core/react-query/airing-schedule/draft';
import {
  useAiringChannelPriorityQuery,
  useAiringChannelsQuery,
  useAiringHiddenChannelsQuery,
  useAiringProvidersQuery,
  useAiringScheduleConfigurationQuery,
  useAiringTrackPriorityQuery,
} from '@/core/react-query/airing-schedule/queries';
import { useConfigurationQuery, useConfigurationSchemaQuery } from '@/core/react-query/configuration/queries';
import { useCurrentUserQuery } from '@/core/react-query/user/queries';
import useSettingsContext from '@/hooks/useSettingsContext';

import type { FormSchemaType } from '@/core/types/api/configuration';

// Members with an editor of their own on this page, saved through the airing schedule endpoints.
const DEDICATED_MEMBERS = new Set([
  'AiringSoonIncludeDateOnly',
  'AiringSoonWindowHours',
  'PreferredChannels',
  'PreferredTracks',
  'SeasonDetailSourceOrder',
]);

/** The members the generic fields render: the editable ones without an editor of their own. */
const getOptionKeys = (schema: FormSchemaType) =>
  Object.keys(schema['x-uiDefinition'].structure ?? {}).filter((key) => {
    const visibility = schema.properties[key]?.['x-uiDefinition']?.visibility?.default ?? 'visible';
    return !!schema.properties[key] && visibility === 'visible' && !DEDICATED_MEMBERS.has(key);
  });

const loadError = (
  <div className="m-auto font-semibold text-panel-text-danger">
    Failed to load the airing schedule settings.
  </div>
);

const loading = <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;

const AiringScheduleSettingsContent = ({ configurationId }: { configurationId: string }) => {
  const { airingScheduleDraft: draft, setAiringScheduleDraft: setDraft } = useSettingsContext();

  const providersQuery = useAiringProvidersQuery();
  const channelsQuery = useAiringChannelsQuery();
  const channelPriorityQuery = useAiringChannelPriorityQuery();
  const hiddenChannelsQuery = useAiringHiddenChannelsQuery();
  const trackPriorityQuery = useAiringTrackPriorityQuery();
  const configQuery = useConfigurationQuery(configurationId);
  const schemaQuery = useConfigurationSchemaQuery(configurationId);
  // Merging channels, editing their aliases and the start season overrides are saved at once, and only for admins.
  const isAdmin = useCurrentUserQuery().data?.IsAdmin ?? false;

  const queries = [
    providersQuery,
    channelsQuery,
    channelPriorityQuery,
    hiddenChannelsQuery,
    trackPriorityQuery,
    configQuery,
    schemaQuery,
  ];
  if (queries.some(query => query.isError)) return loadError;
  if (queries.some(query => query.isPending)) return loading;

  // What the server has, with the unsaved changes over it.
  const serverProviders = sortAiringProviders(providersQuery.data);
  const serverChannels = channelPriorityQuery.data ?? [];
  // Sorted, so hiding and showing a channel again leaves no change behind.
  const serverHidden = sortBy(hiddenChannelsQuery.data ?? []);
  const serverTracks = trackPriorityQuery.data ?? [];
  const serverOptions = configQuery.data ?? {};
  const providers = draft.providers ?? serverProviders;
  const channelIds = draft.channels ?? serverChannels;
  const hiddenIds = draft.hidden ?? serverHidden;
  const tracks = draft.tracks ?? serverTracks;
  const options = { ...serverOptions, ...draft.options };

  const schema = schemaQuery.data!;
  const optionKeys = getOptionKeys(schema);

  return (
    <>
      <title>Settings &gt; Airing Schedule | Shoko</title>
      <div className="flex flex-col gap-y-1">
        <div className="text-xl font-semibold">Airing Schedule</div>
        <div>
          Choose the providers Shoko gets broadcast and streaming times from for the airing schedule, and which airing
          it shows when an episode airs more than once. Everything here, the providers included, waits for Save at the
          bottom of the page, except each provider&apos;s own settings, which are saved with their own button.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {optionKeys.length > 0 && (
        <>
          <div className="flex flex-col gap-y-6">
            <div className="flex items-center font-semibold">General Options</div>
            <div className="flex flex-col gap-y-1">
              {optionKeys.map(key => (
                <div className="flex flex-col gap-y-1" key={key}>
                  <DynamicField
                    onChange={value => setDraft(withAiringScheduleOption(draft, serverOptions, key, value))}
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
          </div>

          <div className="border-b border-panel-border" />
        </>
      )}

      {schema.properties.AiringSoonWindowHours && schema.properties.AiringSoonIncludeDateOnly && (
        <>
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-1">
              <div className="font-semibold">Refresh Anime Airing Soon</div>
              <div className="text-sm opacity-65">
                The scheduled action refreshing from AniDB the anime in the collection with an episode airing soon, so
                their other sources and episode matches follow before it airs. Saved with the service&apos;s options.
              </div>
            </div>
            <AiringSoonRefresh
              options={{
                AiringSoonWindowHours: (options.AiringSoonWindowHours as number | undefined) ?? 24,
                AiringSoonIncludeDateOnly: (options.AiringSoonIncludeDateOnly as boolean | undefined) ?? false,
              }}
              onChange={(key, value) => setDraft(withAiringScheduleOption(draft, serverOptions, key, value))}
            />
          </div>

          <div className="border-b border-panel-border" />
        </>
      )}

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Airing Preferences</div>
          <div className="text-sm opacity-65">
            When an episode airs more than once, the airing on the first channel and track listed leads in the airing
            schedule, on the dashboard and in the season view, with the others behind it.
          </div>
        </div>
        <div className="flex flex-col gap-y-6">
          <PreferredChannels
            channelIds={channelIds}
            channels={channelsQuery.data ?? []}
            onChange={value => setDraft(withAiringScheduleDraft(draft, 'channels', serverChannels, value))}
          />
          <PreferredTracks
            tracks={tracks}
            onChange={value => setDraft(withAiringScheduleDraft(draft, 'tracks', serverTracks, value))}
          />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Channel Visibility</div>
          <div className="text-sm opacity-65">
            The airings of a hidden channel are left out of the airing schedule and the dashboard.
            {isAdmin && ' Merging channels and editing their aliases are saved at once.'}
          </div>
        </div>
        {isAdmin && <ChannelDuplicates channels={channelsQuery.data ?? []} />}
        <ChannelVisibility
          channels={channelsQuery.data ?? []}
          hiddenIds={hiddenIds}
          isAdmin={isAdmin}
          onChange={value => setDraft(withAiringScheduleDraft(draft, 'hidden', serverHidden, sortBy(value)))}
        />
      </div>

      <div className="border-b border-panel-border" />

      {schema.properties.SeasonDetailSourceOrder && (
        <>
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-1">
              <div className="font-semibold">Studio &amp; Genre Sources</div>
              <div className="text-sm opacity-65">
                The sources whose studios and genres the season view shows, in order of preference. AniDB is always
                used, and first unless moved. Saved with the service&apos;s options.
              </div>
            </div>
            <SeasonDetailSources
              order={(options.SeasonDetailSourceOrder as string[] | undefined) ?? []}
              onChange={value =>
                setDraft(withAiringScheduleOption(draft, serverOptions, 'SeasonDetailSourceOrder', value))}
            />
          </div>

          <div className="border-b border-panel-border" />
        </>
      )}

      {isAdmin && (
        <>
          <StartSeasonOverrides />

          <div className="border-b border-panel-border" />
        </>
      )}

      <AiringProviderList
        providers={providers}
        onChange={value => setDraft(withAiringScheduleDraft(draft, 'providers', serverProviders, value))}
      />
    </>
  );
};

/** The page, once the service's configuration is known: its ID is the server's to give. */
const AiringScheduleSettings = () => {
  const configurationQuery = useAiringScheduleConfigurationQuery();
  if (configurationQuery.isError) return loadError;
  if (!configurationQuery.data) return loading;
  return <AiringScheduleSettingsContent configurationId={configurationQuery.data.ID} />;
};

export default AiringScheduleSettings;
