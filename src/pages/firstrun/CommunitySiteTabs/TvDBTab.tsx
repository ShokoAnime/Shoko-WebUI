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

class TvDBTab extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'TvDB', newSettings: { [id]: value } });
  };

  render() {
    const {
      AutoLink, AutoFanart, AutoWideBanners, AutoPosters,
      AutoFanartAmount, AutoPostersAmount, AutoWideBannersAmount,
      UpdateFrequency, Language,
    } = this.props;

    const updateFrequencyOptions: Array<any> = [];
    const languageOptions: Array<any> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });
    tvdbLanguages.forEach((item) => {
      languageOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <TransitionDiv className="flex flex-col w-3/5">
        <div className="font-bold">Download Options</div>
        <Checkbox label="Fanart" id="AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} className="w-full mt-2 mb-1 pr-3" />
        {AutoFanart && (
          <div className="flex justify-between items-center font-mulish">
            Max Fanart
            <InputSmall id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="my-1 w-10 text-center px-2" />
          </div>
        )}
        <Checkbox label="Posters" id="AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        {AutoPosters && (
          <div className="flex justify-between items-center font-mulish">
            Max Posters
            <InputSmall id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="my-1 w-10 text-center px-2" />
          </div>
        )}
        <Checkbox label="Wide Banners" id="AutoWideBanners" isChecked={AutoWideBanners} onChange={this.handleInputChange} className="w-full my-1 pr-3" />
        {AutoWideBanners && (
          <div className="flex justify-between items-center font-mulish">
            Max Wide Banners
            <InputSmall id="AutoWideBannersAmount" value={AutoWideBannersAmount} type="number" onChange={this.handleInputChange} className="my-1 w-10 text-center px-2" />
          </div>
        )}
        <span className="font-bold mt-4">Preferences</span>
        <Checkbox label="Auto Link" id="AutoLink" isChecked={AutoLink} onChange={this.handleInputChange} className="w-full mt-2 mb-1 pr-3" />
        <SelectSmall label="Language" id="Language" value={Language} className="my-1" onChange={this.handleInputChange}>
          {languageOptions}
        </SelectSmall>
        <SelectSmall label="Automatically Update Stats" id="UpdateFrequency" value={UpdateFrequency} className="my-1" onChange={this.handleInputChange}>
          {updateFrequencyOptions}
        </SelectSmall>
      </TransitionDiv>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.TvDB),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(TvDBTab);
