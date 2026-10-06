import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';
import { toNumber } from 'lodash';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import MetadataImageSettings from '@/components/Settings/MetadataSitesSettings/MetadataImageSettings';
import MetadataSourceSettings from '@/components/Settings/MetadataSitesSettings/MetadataSourceSettings';
import { getMetadataSources, isSameKey } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery, useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';

import type {
  SettingsMetadataSourceDefaultsType,
  SettingsMetadataSourceOverridesType,
} from '@/core/types/api/settings';
import type { SettingsPageContextType } from '@/core/types/context';

type Props = Omit<SettingsPageContextType, 'updateSetting'>;

/** How many days before an episode airs it may be matched across sources, from 0 to 365. */
const MatchLookAheadInput = (
  { id, onChange, value }: { id: string, value: number, onChange: (value: number) => void },
) => (
  <div className="flex items-center justify-between">
    Match Episodes Airing Within (Days)
    <InputSmall
      id={id}
      value={value}
      type="number"
      min={0}
      max={365}
      onChange={event => onChange(toNumber(event.target.value))}
      className="w-16 px-3 py-1"
    />
  </div>
);

/**
 * The source defaults, then every metadata source with its providers, auto-linking and own options, each followed
 * by a divider. The settings go into the settings draft and the provider changes into the provider draft, both sent by
 * the page's save.
 */
const MetadataSourceList = ({ metadataDraft, newSettings, setMetadataDraft, setNewSettings }: Props) => {
  const providersQuery = useMetadataProvidersQuery();
  const linkSourcesQuery = useMetadataLinkSourcesQuery();
  const sources = getMetadataSources(providersQuery.data ?? [], linkSourcesQuery.data);

  const { SourceDefaults: sourceDefaults, Sources: sourceOverrides } = newSettings.Metadata;
  const getOverrides = (source: string) => sourceOverrides.find(item => isSameKey(item.Source, source));

  // Sets one of a source's own settings in `Metadata.Sources`; `null` follows the defaults again, and an entry left
  // with nothing of its own is dropped.
  const setSourceOverride = <TKey extends 'EpisodeMatchLookAheadDays' | 'Images'>(
    source: string,
    key: TKey,
    value: SettingsMetadataSourceOverridesType[TKey],
  ) => {
    setNewSettings(produce(newSettings, (draftState) => {
      const entries = draftState.Metadata.Sources;
      let index = entries.findIndex(item => isSameKey(item.Source, source));
      if (index === -1) {
        if (value === null) return;
        entries.push({ Source: source, EpisodeMatchLookAheadDays: null, Images: null });
        index = entries.length - 1;
      }
      entries[index][key] = value;
      if (entries[index].EpisodeMatchLookAheadDays === null && entries[index].Images === null) entries.splice(index, 1);
    }));
  };

  const setSourceDefaults = (value: Partial<SettingsMetadataSourceDefaultsType>) => {
    setNewSettings(produce(newSettings, (draftState) => {
      Object.assign(draftState.Metadata.SourceDefaults, value);
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Source Defaults</div>
          <div className="text-sm opacity-65">For every source without options of its own.</div>
        </div>
        <div className="flex flex-col gap-y-1">
          <MatchLookAheadInput
            id="metadata-match-look-ahead"
            value={sourceDefaults.EpisodeMatchLookAheadDays}
            onChange={value => setSourceDefaults({ EpisodeMatchLookAheadDays: value })}
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <MetadataImageSettings
            id="metadata-images"
            settings={sourceDefaults.Images}
            onChange={value => setSourceDefaults({ Images: value })}
          />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {providersQuery.isPending && (
        <div className="flex justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={2} spin />
        </div>
      )}
      {providersQuery.isSuccess && sources.length === 0 && (
        <>
          <div className="opacity-65">No metadata provider is registered.</div>
          <div className="border-b border-panel-border" />
        </>
      )}
      {sources.map((summary) => {
        const overrides = getOverrides(summary.source);
        const ownLookAhead = overrides?.EpisodeMatchLookAheadDays ?? null;
        const ownImages = overrides?.Images ?? null;
        return (
          <div key={summary.source} className="flex flex-col gap-y-6">
            <MetadataSourceSettings
              summary={summary}
              metadataDraft={metadataDraft}
              setMetadataDraft={setMetadataDraft}
            >
              <div className="flex flex-col gap-y-1">
                <Checkbox
                  justify
                  label="Use Own Episode Matching Window"
                  id={`metadata-${summary.source}-own-match-look-ahead`}
                  isChecked={ownLookAhead !== null}
                  onChange={event =>
                    setSourceOverride(
                      summary.source,
                      'EpisodeMatchLookAheadDays',
                      event.target.checked ? sourceDefaults.EpisodeMatchLookAheadDays : null,
                    )}
                />
                {ownLookAhead !== null && (
                  <MatchLookAheadInput
                    id={`metadata-${summary.source}-match-look-ahead`}
                    value={ownLookAhead}
                    onChange={value => setSourceOverride(summary.source, 'EpisodeMatchLookAheadDays', value)}
                  />
                )}
              </div>
              {summary.providers.some(provider => provider.SupportsImages) && (
                <div className="flex flex-col gap-y-1">
                  <Checkbox
                    justify
                    label="Use Own Image Options"
                    id={`metadata-${summary.source}-own-images`}
                    isChecked={ownImages !== null}
                    onChange={event =>
                      setSourceOverride(summary.source, 'Images', event.target.checked ? sourceDefaults.Images : null)}
                  />
                  {ownImages !== null && (
                    <MetadataImageSettings
                      id={`metadata-${summary.source}-images`}
                      settings={ownImages}
                      onChange={value => setSourceOverride(summary.source, 'Images', value)}
                    />
                  )}
                </div>
              )}
            </MetadataSourceSettings>
            <div className="border-b border-panel-border" />
          </div>
        );
      })}
    </>
  );
};

export default MetadataSourceList;
