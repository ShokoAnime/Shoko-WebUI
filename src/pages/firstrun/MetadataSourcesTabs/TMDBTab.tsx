import React from 'react';

import TMDBSettings from '@/components/Settings/MetadataSitesSettings/TMDBSettings';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/UseFirstRunSettingsContext';

function TMDBTab() {
  const { newSettings, setNewSettings, updateSetting } = useFirstRunSettingsContext();

  return (
    <TransitionDiv className="flex flex-col gap-y-6">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Download Options</div>
      <div className="flex flex-col gap-y-2">
        <TMDBSettings newSettings={newSettings} setNewSettings={setNewSettings} updateSetting={updateSetting} />
      </div>
    </TransitionDiv>
  );
}

export default TMDBTab;
