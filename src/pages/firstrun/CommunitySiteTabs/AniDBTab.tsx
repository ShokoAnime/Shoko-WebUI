/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import SelectSmall from '../../../components/Input/SelectSmall';
import TransitionDiv from '../../../components/TransitionDiv';

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];

function AniDBTab() {
  const dispatch = useDispatch();

  const aniDBSettings = useSelector((state: RootState) => state.localSettings.AniDb);

  const [MaxRelationDepth, setMaxRelationDepth] = useState(3);

  const saveSettings = (newSettings: { [id: string]: any }) => dispatch(
    { type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'AniDb', newSettings } },
  );

  useEffect(() => {
    setMaxRelationDepth(aniDBSettings.MaxRelationDepth);
  }, []);

  useEffect(() => {
    saveSettings({ MaxRelationDepth });
  }, [MaxRelationDepth]);

  const handleInputChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value !== '') {
      saveSettings({ [id]: value });
    }
  };

  const updateFrequencyOptions: Array<React.ReactNode> = [];

  updateFrequencyType.forEach((item) => {
    updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
  });

  const {
    DownloadCharacters, DownloadCreators, DownloadRelatedAnime, MyList_AddFiles,
    MyList_ReadWatched, MyList_ReadUnwatched, MyList_SetWatched, MyList_SetUnwatched,
    MyList_StorageState, MyList_DeleteType, Calendar_UpdateFrequency, Anime_UpdateFrequency,
    MyList_UpdateFrequency, MyListStats_UpdateFrequency, File_UpdateFrequency,
  } = aniDBSettings;

  return (
    <TransitionDiv className="flex flex-col w-96">

      <div className="font-mulish font-bold">Download Options</div>
      <Checkbox label="Character Images" id="DownloadCharacters" isChecked={DownloadCharacters} onChange={handleInputChange} justify className="mt-3" />
      <Checkbox label="Creator Images" id="DownloadCreators" isChecked={DownloadCreators} onChange={handleInputChange} justify className="mt-1" />
      <Checkbox label="Related Anime" id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={handleInputChange} justify className="mt-1" />
      {DownloadRelatedAnime && (
        <TransitionDiv className="flex justify-between mt-1">
          Related Depth
          <InputSmall id="MaxRelationDepth" value={MaxRelationDepth} type="number" onChange={e => setMaxRelationDepth(e.target.value)} className="w-10 text-center px-2" />
        </TransitionDiv>
      )}

      <div className="font-mulish font-bold mt-5">Mylist Options</div>
      <Checkbox label="Add Files" id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={handleInputChange} justify className="mt-3" />
      <Checkbox label="Read Watched" id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={handleInputChange} justify className="mt-1" />
      <Checkbox label="Read Unwatched" id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={handleInputChange} justify className="mt-1" />
      <Checkbox label="Set Watched" id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={handleInputChange} justify className="mt-1" />
      <Checkbox label="Set Unwatched" id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={handleInputChange} justify className="mt-1" />
      <SelectSmall label="Storage State" id="MyList_StorageState" value={MyList_StorageState} onChange={handleInputChange} className="mt-1">
        <option value={0}>Unknown</option>
        <option value={1}>HDD</option>
        <option value={2}>Disk</option>
        <option value={3}>Deleted</option>
        <option value={4}>Remote</option>
      </SelectSmall>
      <SelectSmall label="Delete Action" id="MyList_DeleteType" value={MyList_DeleteType} onChange={handleInputChange} className="mt-1">
        <option value={0}>Delete File (AniDB)</option>
        <option value={1}>Delete File (Local)</option>
        <option value={2}>Mark Deleted</option>
        <option value={3}>Mark External (CD/DVD)</option>
        <option value={4}>Mark Unknown</option>
        <option value={5}>DVD/BD</option>
      </SelectSmall>

      <div className="font-mulish font-bold mt-5">Update Options</div>
      <SelectSmall label="Calendar" id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} onChange={handleInputChange} className="mt-3">
        {updateFrequencyOptions}
      </SelectSmall>
      <SelectSmall label="Anime Information" id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {updateFrequencyOptions}
      </SelectSmall>
      <SelectSmall label="Sync Mylist" id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {updateFrequencyOptions}
      </SelectSmall>
      <SelectSmall label="Get Mylist Stats" id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {updateFrequencyOptions}
      </SelectSmall>
      <SelectSmall label="Files With Missing Info" id="File_UpdateFrequency" value={File_UpdateFrequency} onChange={handleInputChange} className="mt-1">
        {updateFrequencyOptions}
      </SelectSmall>

    </TransitionDiv>
  );
}

export default AniDBTab;
