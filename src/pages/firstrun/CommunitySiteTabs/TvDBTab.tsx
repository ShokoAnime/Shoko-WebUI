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
      updateFrequencyOptions.push(<option value={item[0]}>{item[1]}</option>);
    });
    tvdbLanguages.forEach((item) => {
      languageOptions.push(<option value={item[0]}>{item[1]}</option>);
    });

    return (
      <React.Fragment>
        <div className="flex flex-col w-3/5">
          <span className="font-bold">Download Options</span>
          <Checkbox label="Fanart" id="AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} className="w-full" />
          {AutoFanart && (
            <div className="flex justify-between my-1">
              Max Fanart
              <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-4" />
            </div>
          )}
          <Checkbox label="Posters" id="AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} className="w-full" />
          {AutoPosters && (
            <div className="flex justify-between my-1">
              Max Posters
              <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-4" />
            </div>
          )}
          <Checkbox label="Wide Banners" id="AutoWideBanners" isChecked={AutoWideBanners} onChange={this.handleInputChange} className="w-full" />
          {AutoWideBanners && (
            <div className="flex justify-between my-1">
              Max Wide Banners
              <Input id="AutoWideBannersAmount" value={AutoWideBannersAmount} type="number" onChange={this.handleInputChange} className="w-4" />
            </div>
          )}
          <span className="font-bold mt-4">Preferences</span>
          <Checkbox label="Auto Link" id="AutoLink" isChecked={AutoLink} onChange={this.handleInputChange} className="w-full" />
          <div className="flex justify-between my-1">
            Language
            <Select id="Language" value={Language} className="relative w-24" onChange={this.handleInputChange}>
              {languageOptions}
            </Select>
          </div>
          <div className="flex justify-between my-1">
            Automatically Update Stats
            <Select id="UpdateFrequency" value={UpdateFrequency} className="relative w-32" onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
        </div>
      </React.Fragment>
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
