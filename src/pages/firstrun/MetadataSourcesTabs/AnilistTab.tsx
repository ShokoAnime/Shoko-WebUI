import AnilistDownloadSettings from '@/components/Settings/MetadataSitesSettings/AnilistDownloadSettings';
import AnilistSettings from '@/components/Settings/MetadataSitesSettings/AnilistSettings';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/useFirstRunSettingsContext';

const AnilistTab = () => {
  const { newSettings, setNewSettings, updateSetting } = useFirstRunSettingsContext();

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Linking Options</div>
      <div className="flex flex-col gap-y-2">
        <AnilistSettings newSettings={newSettings} setNewSettings={setNewSettings} updateSetting={updateSetting} />
      </div>

      <div className="border-b-2 border-panel-border pb-4 font-semibold">Download Options</div>
      <div className="flex flex-col gap-y-2">
        <AnilistDownloadSettings newSettings={newSettings} updateSetting={updateSetting} />
      </div>
    </TransitionDiv>
  );
};

export default AnilistTab;
