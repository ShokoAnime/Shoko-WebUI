/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import TransitionDiv from '@/components/TransitionDiv';

import { TestStatusType } from '@/core/slices/firstrun';
import { useFirstRunSettingsContext } from '../FirstRunPage';

type Props = {
  setStatus: (status: TestStatusType) => void;
};

function AniDBTab({ setStatus }: Props) {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const {
    Anime_UpdateFrequency, Calendar_UpdateFrequency, DownloadCharacters,
    DownloadCreators, DownloadRelatedAnime,
    DownloadReleaseGroups, File_UpdateFrequency,
    MaxRelationDepth, MyList_AddFiles, MyList_DeleteType,
    MyList_ReadWatched, MyList_ReadUnwatched, MyList_SetWatched,
    MyList_SetUnwatched, MyList_StorageState, MyList_UpdateFrequency,
    MyListStats_UpdateFrequency,
  } = newSettings.AniDb;

  const handleInputChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateSetting('AniDb', id, value);
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth, 10) < 0 || parseInt(depth, 10) > 5) setStatus({ type: 'error', text: 'Max Relation Depth may only be between 0 and 5' });
    else {
      updateSetting('AniDb', 'MaxRelationDepth', depth);
      setStatus({ type: 'success', text: '' });
    }
  };

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
    <TransitionDiv className="flex flex-col gap-y-2">

      <div className="font-semibold">Download Options</div>
      <Checkbox label="Character Images" id="DownloadCharacters" isChecked={DownloadCharacters} onChange={handleInputChange} justify className="mt-4" />
      <Checkbox label="Creator Images" id="DownloadCreators" isChecked={DownloadCreators} onChange={handleInputChange} justify />
      <Checkbox label="Release Groups" id="DownloadReleaseGroups" isChecked={DownloadReleaseGroups} onChange={handleInputChange} justify />
      <Checkbox label="Related Anime" id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={handleInputChange} justify />
      <div className={cx('flex justify-between items-center transition-opacity', !DownloadRelatedAnime && 'pointer-events-none opacity-50')}>
        Related Depth
        <InputSmall id="max-relation-depth" value={MaxRelationDepth} type="number" onChange={event => validateAndSaveRelationDepth(event.target.value)} className="w-10 text-center px-2" />
      </div>

      <div className="font-semibold mt-6">Mylist Options</div>
      <Checkbox label="Add Files" id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={handleInputChange} justify className="mt-4" />
      <Checkbox label="Read Watched" id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={handleInputChange} justify />
      <Checkbox label="Read Unwatched" id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={handleInputChange} justify />
      <Checkbox label="Set Watched" id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={handleInputChange} justify />
      <Checkbox label="Set Unwatched" id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={handleInputChange} justify />
      <SelectSmall label="Storage State" id="MyList_StorageState" value={MyList_StorageState} onChange={handleInputChange}>
        <option value={0}>Unknown</option>
        <option value={1}>HDD</option>
        <option value={2}>Disk</option>
        <option value={3}>Deleted</option>
        <option value={4}>Remote</option>
      </SelectSmall>
      <SelectSmall label="Delete Action" id="MyList_DeleteType" value={MyList_DeleteType} onChange={handleInputChange}>
        <option value={0}>Delete File (AniDB)</option>
        <option value={1}>Delete File (Local)</option>
        <option value={2}>Mark Deleted</option>
        <option value={3}>Mark External (CD/DVD)</option>
        <option value={4}>Mark Unknown</option>
        <option value={5}>DVD/BD</option>
      </SelectSmall>

      <div className="font-semibold mt-6">Update Options</div>
      <SelectSmall label="Calendar" id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} onChange={handleInputChange} className="mt-4">
        {renderUpdateFrequencyValues()}
      </SelectSmall>
      <SelectSmall label="Anime Information" id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} onChange={handleInputChange}>
        {renderUpdateFrequencyValues()}
      </SelectSmall>
      <SelectSmall label="Sync Mylist" id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} onChange={handleInputChange}>
        {renderUpdateFrequencyValues()}
      </SelectSmall>
      <SelectSmall label="Get Mylist Stats" id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} onChange={handleInputChange}>
        {renderUpdateFrequencyValues()}
      </SelectSmall>
      <SelectSmall label="Files With Missing Info" id="File_UpdateFrequency" value={File_UpdateFrequency} onChange={handleInputChange}>
        {renderUpdateFrequencyValues()}
      </SelectSmall>

    </TransitionDiv>
  );
}

export default AniDBTab;
