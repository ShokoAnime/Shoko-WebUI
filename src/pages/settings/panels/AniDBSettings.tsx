/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

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

type State = {
  MaxRelationDepth: number;
};

class AniDBSettings extends React.Component<Props, State> {
  state = {
    MaxRelationDepth: 3,
  };

  componentDidMount = () => {
    const { MaxRelationDepth } = this.props;
    this.setState({ MaxRelationDepth });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.type === 'number') {
      this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
    }
    if (value !== '') {
      saveSettings({ context: 'AniDb', newSettings: { [id]: value } });
    }
  };

  render() {
    const {
      DownloadCharacters, DownloadCreators, DownloadRelatedAnime,
      MyList_AddFiles, MyList_DeleteType, MyList_ReadUnwatched, MyList_ReadWatched,
      MyList_SetUnwatched, MyList_SetWatched, MyList_StorageState, Calendar_UpdateFrequency,
      Anime_UpdateFrequency, MyList_UpdateFrequency, MyListStats_UpdateFrequency,
      File_UpdateFrequency, isFetching,
    } = this.props;
    const { MaxRelationDepth } = this.state;

    const updateFrequencyOptions: Array<React.ReactNode> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <FixedPanel title="AniDB" isFetching={isFetching}>

        <div className="font-bold">Download Options</div>
        <Checkbox label="Character Images" id="DownloadCharacters" isChecked={DownloadCharacters} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Creator Images" id="DownloadCreators" isChecked={DownloadCreators} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Related Anime" id="DownloadRelatedAnime" isChecked={DownloadRelatedAnime} onChange={this.handleInputChange} className="mt-1" />
        {DownloadRelatedAnime && (
          <div className="flex justify-between mt-1">
            Related Depth
            <InputSmall id="MaxRelationDepth" value={MaxRelationDepth} type="number" onChange={this.handleInputChange} className="w-10 text-center px-2" />
          </div>
        )}

        <div className="font-bold mt-3">Mylist Options</div>
        <Checkbox label="Add Files" id="MyList_AddFiles" isChecked={MyList_AddFiles} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Read Watched" id="MyList_ReadWatched" isChecked={MyList_ReadWatched} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Read Unwatched" id="MyList_ReadUnwatched" isChecked={MyList_ReadUnwatched} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Set Watched" id="MyList_SetWatched" isChecked={MyList_SetWatched} onChange={this.handleInputChange} className="mt-1" />
        <Checkbox label="Set Unwatched" id="MyList_SetUnwatched" isChecked={MyList_SetUnwatched} onChange={this.handleInputChange} className="mt-1" />
        <SelectSmall label="Storage State" id="MyList_StorageState" value={MyList_StorageState} onChange={this.handleInputChange} className="mt-1">
          <option value={0}>Unknown</option>
          <option value={1}>HDD</option>
          <option value={2}>Disk</option>
          <option value={3}>Deleted</option>
          <option value={4}>Remote</option>
        </SelectSmall>
        <SelectSmall label="Delete Action" id="MyList_DeleteType" value={MyList_DeleteType} onChange={this.handleInputChange} className="mt-1">
          <option value={0}>Delete File (AniDB)</option>
          <option value={1}>Delete File (Local)</option>
          <option value={2}>Mark Deleted</option>
          <option value={3}>Mark External (CD/DVD)</option>
          <option value={4}>Mark Unknown</option>
          <option value={5}>DVD/BD</option>
        </SelectSmall>

        <div className="font-bold mt-3">Update Options</div>
        <SelectSmall label="Calendar" id="Calendar_UpdateFrequency" value={Calendar_UpdateFrequency} onChange={this.handleInputChange} className="mt-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Anime Information" id="Anime_UpdateFrequency" value={Anime_UpdateFrequency} onChange={this.handleInputChange} className="mt-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Sync Mylist" id="MyList_UpdateFrequency" value={MyList_UpdateFrequency} onChange={this.handleInputChange} className="mt-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Get Mylist Stats" id="MyListStats_UpdateFrequency" value={MyListStats_UpdateFrequency} onChange={this.handleInputChange} className="mt-1">
          {updateFrequencyOptions}
        </SelectSmall>
        <SelectSmall label="Files With Missing Info" id="File_UpdateFrequency" value={File_UpdateFrequency} onChange={this.handleInputChange} className="mt-1">
          {updateFrequencyOptions}
        </SelectSmall>

      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.AniDb),
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBSettings);
