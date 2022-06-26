import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import TransitionDiv from '../../../components/TransitionDiv';

function MovieDBTab() {
  const dispatch = useDispatch();

  const movieDBSettings = useSelector((state: RootState) => state.localSettings.MovieDb);

  const [AutoFanartAmount, setAutoFanartAmount] = useState(10);
  const [AutoPostersAmount, setAutoPostersAmount] = useState(10);

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'MovieDb', newSettings } },
  );

  useEffect(() => {
    setAutoFanartAmount(movieDBSettings.AutoFanartAmount);
    setAutoPostersAmount(movieDBSettings.AutoPostersAmount);
  }, []);

  useEffect(() => {
    saveSettings({ AutoFanartAmount, AutoPostersAmount });
  }, [AutoFanartAmount, AutoPostersAmount]);

  const handleInputChange = (event: any) => {
    const propId = event.target.id.replace('MovieDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value !== '') {
      saveSettings({ [propId]: value });
    }
  };

  return (
    <TransitionDiv className="flex flex-col w-96">

      <div className="font-rubik font-bold">Download Options</div>
      <Checkbox label="Fanart" id="MovieDB_AutoFanart" isChecked={movieDBSettings.AutoFanart} onChange={handleInputChange} justify className="mt-1" />
      {movieDBSettings.AutoFanart && (
        <TransitionDiv className="flex justify-between mt-1">
          Max Fanart
          <InputSmall id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={e => setAutoFanartAmount(e.target.value)} className="w-10 text-center px-2" />
        </TransitionDiv>
      )}
      <Checkbox label="Posters" id="MovieDB_AutoPosters" isChecked={movieDBSettings.AutoPosters} onChange={handleInputChange} justify className="mt-1" />
      {movieDBSettings.AutoPosters && (
        <TransitionDiv className="flex justify-between mt-1">
          Max Posters
          <InputSmall id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={e => setAutoPostersAmount(e.target.value)} className="w-10 text-center px-2" />
        </TransitionDiv>
      )}

    </TransitionDiv>
  );
}

export default MovieDBTab;
