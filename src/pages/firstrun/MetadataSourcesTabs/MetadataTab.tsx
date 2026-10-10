import MetadataSearchSettings from '@/components/Settings/MetadataSitesSettings/MetadataSearchSettings';
import MetadataSourceList from '@/components/Settings/MetadataSitesSettings/MetadataSourceList';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/useFirstRunSettingsContext';

const MetadataTab = () => {
  const { metadataDraft, newSettings, setMetadataDraft, setNewSettings } = useFirstRunSettingsContext();

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <div>
        The sources Shoko gets information and images from besides AniDB. Everything here is saved with Next, except
        each provider&apos;s own settings, which are saved with their own button.
      </div>

      <div className="border-b border-panel-border" />

      <div className="flex flex-col gap-y-6">
        <div className="font-semibold">Search Options</div>
        <div className="flex flex-col gap-y-1">
          <MetadataSearchSettings newSettings={newSettings} setNewSettings={setNewSettings} />
        </div>
      </div>

      <div className="border-b border-panel-border" />

      <MetadataSourceList
        metadataDraft={metadataDraft}
        newSettings={newSettings}
        setMetadataDraft={setMetadataDraft}
        setNewSettings={setNewSettings}
      />
    </TransitionDiv>
  );
};

export default MetadataTab;
