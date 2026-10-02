import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';
import MetadataImageSettings from '@/components/Settings/MetadataSitesSettings/MetadataImageSettings';
import MetadataSourceSettings from '@/components/Settings/MetadataSitesSettings/MetadataSourceSettings';
import { getMetadataSources, isSameKey } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery, useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';

import type { SettingsMetadataImageType } from '@/core/types/api/settings';
import type { SettingsPageContextType } from '@/core/types/context';

type Props = Omit<SettingsPageContextType, 'updateSetting'>;

/**
 * The image defaults, then every metadata source with its providers, auto-linking and own image options, each followed
 * by a divider. The settings go into the settings draft and the provider changes into the provider draft, both sent by
 * the page's save.
 */
const MetadataSourceList = ({ metadataDraft, newSettings, setMetadataDraft, setNewSettings }: Props) => {
  const providersQuery = useMetadataProvidersQuery();
  const linkSourcesQuery = useMetadataLinkSourcesQuery();
  const sources = getMetadataSources(providersQuery.data ?? [], linkSourcesQuery.data);

  const { MetadataSourceDefaults: imageDefaults, MetadataSources: sourceImages } = newSettings.Image;

  // Where a source's own image options are in `Image.MetadataSources`, or -1 when it follows the defaults.
  const getSourceImagesIndex = (source: string) => sourceImages.findIndex(item => isSameKey(item.Source, source));

  // `null` drops the source's own image options, so it follows the defaults again.
  const setSourceImages = (source: string, value: SettingsMetadataImageType | null) => {
    setNewSettings(produce(newSettings, (draftState) => {
      const index = getSourceImagesIndex(source);
      const entries = draftState.Image.MetadataSources;
      if (value === null) {
        if (index !== -1) entries.splice(index, 1);
      } else if (index === -1) {
        entries.push({ ...value, Source: source });
      } else {
        entries[index] = { ...value, Source: entries[index].Source };
      }
    }));
  };

  const setImageDefaults = (value: SettingsMetadataImageType) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.Image.MetadataSourceDefaults = value;
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">Image Options</div>
          <div className="text-sm opacity-65">For every source without image options of its own.</div>
        </div>
        <div className="flex flex-col gap-y-1">
          <MetadataImageSettings id="metadata-images" settings={imageDefaults} onChange={setImageDefaults} />
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
        const imagesIndex = getSourceImagesIndex(summary.source);
        return (
          <div key={summary.source} className="flex flex-col gap-y-6">
            <MetadataSourceSettings
              summary={summary}
              metadataDraft={metadataDraft}
              setMetadataDraft={setMetadataDraft}
            >
              {summary.providers.some(provider => provider.SupportsImages) && (
                <div className="flex flex-col gap-y-1">
                  <Checkbox
                    justify
                    label="Use Own Image Options"
                    id={`metadata-${summary.source}-own-images`}
                    isChecked={imagesIndex !== -1}
                    onChange={event => setSourceImages(summary.source, event.target.checked ? imageDefaults : null)}
                  />
                  {imagesIndex !== -1 && (
                    <MetadataImageSettings
                      id={`metadata-${summary.source}-images`}
                      settings={sourceImages[imagesIndex]}
                      onChange={value => setSourceImages(summary.source, value)}
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
