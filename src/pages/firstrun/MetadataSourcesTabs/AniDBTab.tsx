import AniDBSettings from '@/components/Settings/AniDBSettings';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/useFirstRunSettingsContext';

const AniDBTab = () => {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <AniDBSettings
        isFirstRun
        newSettings={newSettings}
        updateSetting={updateSetting}
      />
    </TransitionDiv>
  );
};

export default AniDBTab;
