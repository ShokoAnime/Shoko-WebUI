/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Checkbox from '../../../components/Input/Checkbox';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Input/Select';

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
      updateFrequencyOptions.push(<option value={item[0]}>{item[1]}</option>);
    });

    return (
      <React.Fragment>
        <span className="font-bold">AniDB Download Options</span>
        <div className="flex w-3/5 justify-between mt-2">
          Character Images
          <Checkbox id="DownloadCharacters" isChecked={DownloadCharacters} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Creator Images
          <Checkbox id="DownloadCreators" isChecked={DownloadCreators} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Related Anime
          <Checkbox id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Related Depth
          <Input id="MaxRelationDepth" value={MaxRelationDepth} type="number" onChange={this.handleInputChange} className="w-8" />
        </div>
        <span className="font-bold mt-6">AniDB Mylist Options</span>
        <div className="flex w-3/5 justify-between mt-2">
          Add Files
          <Checkbox id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Read Watched
          <Checkbox id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Read Unwatched
          <Checkbox id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Set Watched
          <Checkbox id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Read Unwatched
          <Checkbox id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Storage State
          <Select id="MyList_DeleteType" value={MyList_DeleteType} className="relative w-1/3" onChange={this.handleInputChange}>
            <option value="0">Unknown</option>
            <option value="1">HDD</option>
            <option value="2">Disk</option>
            <option value="3">Deleted</option>
            <option value="4">Remote</option>
          </Select>
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Delete Action
          <Select id="MyList_StorageState" value={MyList_StorageState} className="relative w-7/12" onChange={this.handleInputChange}>
            <option value="0">Delete File (AniDB)</option>
            <option value="1">Delete File (Local)</option>
            <option value="2">Mark Deleted</option>
            <option value="3">Mark External (CD/DVD)</option>
            <option value="4">Mark Unknown</option>
            <option value="5">DVD/BD</option>
          </Select>
        </div>
        <span className="font-bold mt-6">AniDB Update Options</span>
        <div className="flex w-3/5 justify-between mt-2">
          Calendar
          <Select id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} className="relative w-2/5" onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Anime Information
          <Select id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} className="relative w-2/5" onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Sync Mylist
          <Select id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} className="relative w-2/5" onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Get Mylist Stats
          <Select id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} className="relative w-2/5" onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
        <div className="flex w-3/5 justify-between mt-1 mb-4">
          Files With Missing Info
          <Select id="File_UpdateFrequency" value={File_UpdateFrequency} className="relative w-2/5" onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
      </React.Fragment>
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
