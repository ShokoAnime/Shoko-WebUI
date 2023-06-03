import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import TransitionDiv from '@/components/TransitionDiv';
import { useFirstRunSettingsContext } from '../FirstRunPage';

function MovieDBTab() {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const { AutoFanart, AutoFanartAmount, AutoPosters, AutoPostersAmount } = newSettings.MovieDb;

  const handleInputChange = (event: any) => {
    const propId = event.target.id.replace('MovieDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('MovieDb', propId, value);
  };

  return (
    <TransitionDiv className="flex flex-col gap-y-2">

      <div className="font-semibold">Download Options</div>
      <Checkbox label="Fanart" id="MovieDB_AutoFanart" isChecked={AutoFanart} onChange={handleInputChange} justify className="mt-4" />
      <div className={cx('flex justify-between transition-opacity', !AutoFanart && 'pointer-events-none opacity-50')}>
        Max Fanart
        <InputSmall id="MovieDB_AutoFanartAmount" value={AutoFanartAmount} type="text" onChange={handleInputChange} className="w-10 px-2 py-0.5" />
      </div>
      <Checkbox label="Posters" id="MovieDB_AutoPosters" isChecked={AutoPosters} onChange={handleInputChange} justify />
      <div className={cx('flex justify-between transition-opacity', !AutoPosters && 'pointer-events-none opacity-50')}>
        Max Posters
        <InputSmall id="MovieDB_AutoPostersAmount" value={AutoPostersAmount} type="text" onChange={handleInputChange} className="w-10 px-2 py-0.5" />
      </div>

    </TransitionDiv>
  );
}

export default MovieDBTab;
