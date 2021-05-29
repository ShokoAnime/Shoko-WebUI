/* eslint-disable @typescript-eslint/naming-convention */
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
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <React.Fragment>
        <div className="flex flex-col w-3/5">
          <span className="font-bold">Download Options</span>
          <Checkbox label="Character Images" id="DownloadCharacters" isChecked={DownloadCharacters} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Creator Images" id="DownloadCreators" isChecked={DownloadCreators} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Related Anime" id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={this.handleInputChange} className="w-full" />
          {DownloadRelatedAnime && (
            <div className="flex justify-between my-1">
              Related Depth
              <Input id="MaxRelationDepth" value={MaxRelationDepth} type="number" onChange={this.handleInputChange} className="w-4" />
            </div>
          )}
          <span className="font-bold mt-4">Mylist Options</span>
          <Checkbox label="Add Files" id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Read Watched" id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Read Unwatched" id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Set Watched" id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={this.handleInputChange} className="w-full" />
          <Checkbox label="Set Unwatched" id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={this.handleInputChange} className="w-full" />
          <div className="flex justify-between my-1">
            Storage State
            <Select id="MyList_DeleteType" value={MyList_DeleteType} onChange={this.handleInputChange}>
              <option value={0}>Unknown</option>
              <option value={1}>HDD</option>
              <option value={2}>Disk</option>
              <option value={3}>Deleted</option>
              <option value={4}>Remote</option>
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Delete Action
            <Select id="MyList_StorageState" value={MyList_StorageState} onChange={this.handleInputChange}>
              <option value={0}>Delete File (AniDB)</option>
              <option value={1}>Delete File (Local)</option>
              <option value={2}>Mark Deleted</option>
              <option value={3}>Mark External (CD/DVD)</option>
              <option value={4}>Mark Unknown</option>
              <option value={5}>DVD/BD</option>
            </Select>
          </div>
          <span className="font-bold mt-4">Update Options</span>
          <div className="flex justify-between my-1">
            Calendar
            <Select id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Anime Information
            <Select id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Sync Mylist
            <Select id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Get Mylist Stats
            <Select id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Files With Missing Info
            <Select id="File_UpdateFrequency" value={File_UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
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
