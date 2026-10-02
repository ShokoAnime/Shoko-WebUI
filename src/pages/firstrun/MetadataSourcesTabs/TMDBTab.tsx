import { produce } from 'immer';

import Checkbox from '@/components/Input/Checkbox';
import MetadataAutoLinkSettings from '@/components/Settings/MetadataSitesSettings/MetadataAutoLinkSettings';
import MetadataImageSettings from '@/components/Settings/MetadataSitesSettings/MetadataImageSettings';
import TransitionDiv from '@/components/TransitionDiv';
import { isTmdbSource } from '@/core/react-query/metadata/helpers';
import { useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';
import useFirstRunSettingsContext from '@/hooks/useFirstRunSettingsContext';

const TMDBTab = () => {
  const { newSettings, setNewSettings } = useFirstRunSettingsContext();

  const tmdbProviders = useMetadataProvidersQuery().data?.filter(provider => isTmdbSource(provider.Source)) ?? [];

  const handleIncludeRestrictedChange = (value: boolean) => {
    setNewSettings(produce(newSettings, (draftState) => {
      draftState.WebUI_Settings.collection.tmdb.includeRestricted = value;
    }));
  };

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Linking Options</div>
      <div className="flex flex-col gap-y-2">
        {tmdbProviders.length > 0 && <MetadataAutoLinkSettings providers={tmdbProviders} source="TMDB" />}
        <Checkbox
          justify
          label="Include Restricted in Search"
          id="include-restricted-tmdb"
          isChecked={newSettings.WebUI_Settings.collection.tmdb.includeRestricted}
          onChange={event => handleIncludeRestrictedChange(event.target.checked)}
        />
      </div>

      <div className="border-b-2 border-panel-border pb-4 font-semibold">Image Options</div>
      <div className="flex flex-col gap-y-2">
        <MetadataImageSettings
          id="metadata-images"
          settings={newSettings.Image.MetadataSourceDefaults}
          onChange={value =>
            setNewSettings(produce(newSettings, (draftState) => {
              draftState.Image.MetadataSourceDefaults = value;
            }))}
        />
      </div>
    </TransitionDiv>
  );
};

export default TMDBTab;
