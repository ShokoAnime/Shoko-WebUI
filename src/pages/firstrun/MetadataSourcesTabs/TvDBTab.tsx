import React from 'react';
import cx from 'classnames';

import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import SelectSmall from '../../../components/Input/SelectSmall';
import TransitionDiv from '../../../components/TransitionDiv';
import { useFirstRunSettingsContext } from '../FirstRunPage';
import { tvdbLanguages } from '../../settings/tabs/MetadataSitesSettings';

function TvDBTab() {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const handleInputChange = (event: any) => {
    const propId = event.target.id.replace('TvDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('TvDB', propId, value);
  };

  const {
    AutoFanart, AutoFanartAmount,
    AutoPosters, AutoPostersAmount,
    AutoWideBanners, AutoWideBannersAmount,
    AutoLink, Language, UpdateFrequency,
  } = newSettings.TvDB;

  const renderUpdateFrequencyValues = () => (
    <>
      <option value={1}>Never</option>
      <option value={2}>Every 6 Hours</option>
      <option value={3}>Every 12 Hours</option>
      <option value={4}>Every 24 Hours</option>
      <option value={5}>Once a Week</option>
      <option value={6}>Once a Month</option>
    </>
  );

  return (
    <TransitionDiv className="flex flex-col w-96">

      <div className="font-semibold">Download Options</div>
      <Checkbox label="Fanart" id="TvDB_AutoFanart" isChecked={AutoFanart} onChange={handleInputChange} justify className="mt-4" />
      <div className={cx('flex justify-between mt-2 transition-opacity', !AutoFanart && 'pointer-events-none opacity-50')}>
        Max Fanart
        <InputSmall id="TvDB_AutoFanartAmount" value={AutoFanartAmount} type="text" onChange={handleInputChange} className="w-10 px-2 py-0.5" />
      </div>
      <Checkbox label="Posters" id="TvDB_AutoPosters" isChecked={AutoPosters} onChange={handleInputChange} justify className="mt-1" />
      <div className={cx('flex justify-between mt-2 transition-opacity', !AutoPosters && 'pointer-events-none opacity-50')}>
        Max Posters
        <InputSmall id="TvDB_AutoPostersAmount" value={AutoPostersAmount} type="text" onChange={handleInputChange} className="w-10 px-2 py-0.5" />
      </div>
      <Checkbox label="Wide Banners" id="TvDB_AutoWideBanners" isChecked={AutoWideBanners} onChange={handleInputChange} justify className="mt-1" />
      <div className={cx('flex justify-between mt-2 transition-opacity', !AutoWideBanners && 'pointer-events-none opacity-50')}>
        Max Wide Banners
        <InputSmall id="TvDB_AutoWideBannersAmount" value={AutoWideBannersAmount} type="text" onChange={handleInputChange} className="w-10 px-2 py-0.5" />
      </div>

      <div className="font-semibold mt-5">Preferences</div>
      <Checkbox label="Auto Link" id="TvDB_AutoLink" isChecked={AutoLink} onChange={handleInputChange} justify className="mt-4" />
      <SelectSmall label="Language" id="TvDB_Language" value={Language} onChange={handleInputChange} className="mt-1">
        {tvdbLanguages.map(
          item => (<option value={item[0]} key={item[0]}>{item[1]}</option>),
        )}
      </SelectSmall>
      <SelectSmall label="Automatically Update Stats" id="UpdateFrequency" value={UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {renderUpdateFrequencyValues()}
      </SelectSmall>
    </TransitionDiv>
  );
}

export default TvDBTab;
