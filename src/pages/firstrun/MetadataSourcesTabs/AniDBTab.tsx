/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import TransitionDiv from '@/components/TransitionDiv';
import useFirstRunSettingsContext from '@/hooks/UseFirstRunSettingsContext';

import type { TestStatusType } from '@/core/slices/firstrun';

type Props = {
  setStatus: (status: TestStatusType) => void;
};

function AniDBTab({ setStatus }: Props) {
  const { newSettings, updateSetting } = useFirstRunSettingsContext();

  const {
    Anime_UpdateFrequency,
    Calendar_UpdateFrequency,
    DownloadCharacters,
    DownloadCreators,
    DownloadRelatedAnime,
    DownloadReleaseGroups,
    File_UpdateFrequency,
    MaxRelationDepth,
    MyList_AddFiles,
    MyList_DeleteType,
    MyList_ReadUnwatched,
    MyList_ReadWatched,
    MyList_SetUnwatched,
    MyList_SetWatched,
    MyList_StorageState,
    MyList_UpdateFrequency,
    MyListStats_UpdateFrequency,
  } = newSettings.AniDb;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (event) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' && 'checked' in event.target
      ? event.target.checked
      : event.target.value;
    updateSetting('AniDb', id, value);
  };

  const validateAndSaveRelationDepth = (depth: string) => {
    if (parseInt(depth, 10) < 0 || parseInt(depth, 10) > 5) {
      setStatus({ type: 'error', text: 'Max Relation Depth may only be between 0 and 5' });
    } else {
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
    <TransitionDiv className="flex flex-col gap-y-6">
      <div className="border-b-2 border-panel-border pb-4 font-semibold">Download Options</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          label="Character Images"
          id="DownloadCharacters"
          isChecked={DownloadCharacters}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Creator Images"
          id="DownloadCreators"
          isChecked={DownloadCreators}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Release Groups"
          id="DownloadReleaseGroups"
          isChecked={DownloadReleaseGroups}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Related Anime"
          id="DownloadRelatedAnime"
          isChecked={DownloadRelatedAnime}
          onChange={handleInputChange}
          justify
        />
        <div
          className={cx(
            'flex justify-between items-center transition-opacity',
            !DownloadRelatedAnime && 'pointer-events-none opacity-65',
          )}
        >
          Related Depth
          <InputSmall
            id="max-relation-depth"
            value={MaxRelationDepth}
            type="number"
            onChange={event => validateAndSaveRelationDepth(event.target.value)}
            className="w-10 px-2 text-center"
          />
        </div>
      </div>

      <div className="border-b-2 border-panel-border pb-4 font-semibold">Mylist Options</div>
      <div className="flex flex-col gap-y-2">
        <Checkbox
          label="Add Files"
          id="MyList_AddFiles"
          isChecked={MyList_AddFiles}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Read Watched"
          id="MyList_ReadWatched"
          isChecked={MyList_ReadWatched}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Read Unwatched"
          id="MyList_ReadUnwatched"
          isChecked={MyList_ReadUnwatched}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Set Watched"
          id="MyList_SetWatched"
          isChecked={MyList_SetWatched}
          onChange={handleInputChange}
          justify
        />
        <Checkbox
          label="Set Unwatched"
          id="MyList_SetUnwatched"
          isChecked={MyList_SetUnwatched}
          onChange={handleInputChange}
          justify
        />
        <SelectSmall
          label="Storage State"
          id="MyList_StorageState"
          value={MyList_StorageState}
          onChange={handleInputChange}
        >
          <option value={0}>Unknown</option>
          <option value={1}>HDD</option>
          <option value={2}>Disk</option>
          <option value={3}>Deleted</option>
          <option value={4}>Remote</option>
        </SelectSmall>
        <SelectSmall
          label="Delete Action"
          id="MyList_DeleteType"
          value={MyList_DeleteType}
          onChange={handleInputChange}
        >
          <option value={0}>Delete File (AniDB)</option>
          <option value={1}>Delete File (Local)</option>
          <option value={2}>Mark Deleted</option>
          <option value={3}>Mark External (CD/DVD)</option>
          <option value={4}>Mark Unknown</option>
          <option value={5}>DVD/BD</option>
        </SelectSmall>
      </div>

      <div className="border-b-2 border-panel-border pb-4 font-semibold">Update Options</div>
      <div className="flex flex-col gap-y-2">
        <SelectSmall
          label="Calendar"
          id="Calendar_UpdateFrequency"
          value={Calendar_UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
        <SelectSmall
          label="Anime Information"
          id="Anime_UpdateFrequency"
          value={Anime_UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
        <SelectSmall
          label="Sync Mylist"
          id="MyList_UpdateFrequency"
          value={MyList_UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
        <SelectSmall
          label="Get Mylist Stats"
          id="MyListStats_UpdateFrequency"
          value={MyListStats_UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
        <SelectSmall
          label="Files With Missing Info"
          id="File_UpdateFrequency"
          value={File_UpdateFrequency}
          onChange={handleInputChange}
        >
          {renderUpdateFrequencyValues()}
        </SelectSmall>
      </div>
    </TransitionDiv>
  );
}

export default AniDBTab;
