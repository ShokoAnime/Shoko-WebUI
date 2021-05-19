/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

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

class AniDBTab extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'AniDb', newSettings: { [id]: value } });
  };

  render() {
    const {
      DownloadCharacters, DownloadCreators, DownloadRelatedAnime, MaxRelationDepth,
      MyList_AddFiles, MyList_DeleteType, MyList_ReadUnwatched, MyList_ReadWatched,
      MyList_SetUnwatched, MyList_SetWatched, MyList_StorageState, Calendar_UpdateFrequency,
      Anime_UpdateFrequency, MyList_UpdateFrequency, MyListStats_UpdateFrequency,
      File_UpdateFrequency,
    } = this.props;

    const updateFrequencyOptions: Array<any> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <TransitionDiv className="flex flex-col w-3/5">
        <div className="font-bold">Download Options</div>
        <Checkbox label="Character Images" id="DownloadCharacters" isChecked={DownloadCharacters} onChange={this.handleInputChange} className="w-full mt-2 mb-1 pr-3" />
        <Checkbox label="Creator Images" id="DownloadCreators" isChecked={DownloadCreators} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        <Checkbox label="Related Anime" id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        {DownloadRelatedAnime && (
          <div className="flex justify-between items-center font-mulish">
            Relation Depth
            <InputSmall id="MaxRelationDepth" value={MaxRelationDepth} type="number" onChange={this.handleInputChange} className="my-1 w-10 text-center px-2" />
          </div>
        )}
        <div className="font-bold mt-4">Mylist Options</div>
        <Checkbox label="Add Files" id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={this.handleInputChange} className="w-full mt-2 mb-1 pr-3" />
        <Checkbox label="Read Watched" id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        <Checkbox label="Read Unwatched" id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        <Checkbox label="Set Watched" id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        <Checkbox label="Set Unwatched" id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        <SelectSmall label="Storage State" id="MyList_DeleteType" value={MyList_DeleteType} onChange={this.handleInputChange} className="my-1">
          <option value={0}>Unknown</option>
          <option value={1}>HDD</option>
          <option value={2}>Disk</option>
          <option value={3}>Deleted</option>
          <option value={4}>Remote</option>
        </SelectSmall>
        <SelectSmall label="Delete Action" id="MyList_StorageState" value={MyList_StorageState} onChange={this.handleInputChange} className="my-1">
          <option value={0}>Delete File (AniDB)</option>
          <option value={1}>Delete File (Local)</option>
          <option value={2}>Mark Deleted</option>
          <option value={3}>Mark External (CD/DVD)</option>
          <option value={4}>Mark Unknown</option>
          <option value={5}>DVD/BD</option>
        </SelectSmall>
        <div className="font-bold mt-4">Update Options</div>
        <SelectSmall label="Calendar" id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} onChange={this.handleInputChange} className="mt-2 mb-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Anime Information" id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} onChange={this.handleInputChange} className="my-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Sync Mylist" id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} onChange={this.handleInputChange} className="my-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Get Mylist Stats" id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} onChange={this.handleInputChange} className="my-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Files With Missing Info" id="File_UpdateFrequency" value={File_UpdateFrequency} onChange={this.handleInputChange} className="my-1">
          {updateFrequencyOptions}
        </SelectSmall>
      </TransitionDiv>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.AniDb),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBTab);
