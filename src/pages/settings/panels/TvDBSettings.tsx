import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import SelectSmall from '../../../components/Input/SelectSmall';

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];

const tvdbLanguages = [
  ['en', 'English'],
  ['sv', 'Swedish'],
  ['no', 'Norwegian'],
  ['da', 'Danish'],
  ['fi', 'Finnish'],
  ['nl', 'Dutch'],
  ['de', 'German'],
  ['it', 'Italian'],
  ['es', 'Spanish'],
  ['fr', 'French'],
  ['pl', 'Polish'],
  ['hu', 'Hungarian'],
  ['el', 'Greek'],
  ['tr', 'Turkish'],
  ['ru', 'Russian'],
  ['he', 'Hebrew'],
  ['ja', 'Japanese'],
  ['pt', 'Portuguese'],
  ['cs', 'Czech'],
  ['sl', 'Slovenian'],
  ['hr', 'Croatian'],
  ['ko', 'Korean'],
  ['zh', 'Chinese'],
];

function TvDBSettings() {
  const dispatch = useDispatch();

  const isFetching = useSelector((state: RootState) => state.fetching.settings);
  const tvDBSettings = useSelector((state: RootState) => state.localSettings.TvDB);

  const [AutoFanartAmount, setAutoFanartAmount] = useState(10);
  const [AutoPostersAmount, setAutoPostersAmount] = useState(10);
  const [AutoWideBannersAmount, setAutoWideBannersAmount] = useState(10);

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'TvDB', newSettings } },
  );

  useEffect(() => {
    setAutoFanartAmount(tvDBSettings.AutoFanartAmount);
    setAutoPostersAmount(tvDBSettings.AutoPostersAmount);
    setAutoWideBannersAmount(tvDBSettings.AutoWideBannersAmount);
  }, []);

  const handleInputChange = (event: any) => {
    const propId = event.target.id.replace('TvDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value !== '') {
      saveSettings({ [propId]: value });
    }
  };

  return (
    <FixedPanel title="TvDB" isFetching={isFetching}>

      <div className="font-bold">Download Options</div>
      <Checkbox label="Fanart" id="TvDB_AutoFanart" isChecked={tvDBSettings.AutoFanart} onChange={handleInputChange} className="mt-1" />
      {tvDBSettings.AutoFanart && (
        <div className="flex justify-between mt-1">
          Max Fanart
          <InputSmall id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={e => setAutoFanartAmount(e.target.value)} className="w-10 text-center px-2" />
        </div>
      )}
      <Checkbox label="Posters" id="TvDB_AutoPosters" isChecked={tvDBSettings.AutoPosters} onChange={handleInputChange} className="mt-1" />
      {tvDBSettings.AutoPosters && (
        <div className="flex justify-between mt-1">
          Max Posters
          <InputSmall id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={e => setAutoPostersAmount(e.target.value)} className="w-10 text-center px-2" />
        </div>
      )}
      <Checkbox label="Wide Banners" id="TvDB_AutoWideBanners" isChecked={tvDBSettings.AutoWideBanners} onChange={handleInputChange} className="mt-1" />
      {tvDBSettings.AutoWideBanners && (
        <div className="flex justify-between mt-1">
          Max Wide Banners
          <InputSmall id="AutoWideBannersAmount" value={AutoWideBannersAmount} type="number" onChange={e => setAutoWideBannersAmount(e.target.value)} className="w-10 text-center px-2" />
        </div>
      )}

      <div className="font-bold mt-3">Preferences</div>
      <Checkbox label="Auto Link" id="TvDB_AutoLink" isChecked={tvDBSettings.AutoLink} onChange={handleInputChange} className="mt-1" />
      <SelectSmall label="Language" id="Language" value={tvDBSettings.Language} onChange={handleInputChange} className="mt-1">
        {tvdbLanguages.map(
          item => (<option value={item[0]} key={item[0]}>{item[1]}</option>),
        )}
      </SelectSmall>
      <SelectSmall label="Automatically Update Stats" id="UpdateFrequency" value={tvDBSettings.UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {updateFrequencyType.map(
          item => (<option value={item[0]} key={item[0]}>{item[1]}</option>),
        )}
      </SelectSmall>
    </FixedPanel>
  );
}

export default TvDBSettings;
