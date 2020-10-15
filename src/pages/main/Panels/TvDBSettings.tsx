import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
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

type State = {
  AutoFanartAmount: number;
  AutoPostersAmount: number;
  AutoWideBannersAmount: number;
};

class TvDBSettings extends React.Component<Props, State> {
  state = {
    AutoFanartAmount: 10,
    AutoPostersAmount: 10,
    AutoWideBannersAmount: 10,
  };

  componentDidMount = () => {
    const {
      AutoFanartAmount, AutoPostersAmount, AutoWideBannersAmount,
    } = this.props;
    this.setState({ AutoFanartAmount, AutoPostersAmount, AutoWideBannersAmount });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const propId = id.replace('TvDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.type === 'number') {
      this.setState(prevState => Object.assign({}, prevState, { [propId]: value }));
    }
    if (value !== '') {
      saveSettings({ context: 'TvDB', newSettings: { [propId]: value } });
    }
  };

  render() {
    const {
      AutoLink, AutoFanart, AutoWideBanners, AutoPosters,
      UpdateFrequency, Language, isFetching,
    } = this.props;
    const { AutoFanartAmount, AutoPostersAmount, AutoWideBannersAmount } = this.state;

    const updateFrequencyOptions: Array<any> = [];
    const languageOptions: Array<any> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });
    tvdbLanguages.forEach((item) => {
      languageOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <FixedPanel title="TvDB" isFetching={isFetching}>
        <React.Fragment>
          <span className="font-bold mt-2">Download Options</span>
          <Checkbox label="Fanart" id="TvDB_AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} className="w-full" />
          {AutoFanart && (
            <div className="flex justify-between my-1">
              Max Fanart
              <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-4" center />
            </div>
          )}
          <Checkbox label="Posters" id="TvDB_AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} className="w-full" />
          {AutoPosters && (
            <div className="flex justify-between my-1">
              Max Posters
              <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-4" center />
            </div>
          )}
          <Checkbox label="Wide Banners" id="TvDB_AutoWideBanners" isChecked={AutoWideBanners} onChange={this.handleInputChange} className="w-full" />
          {AutoWideBanners && (
            <div className="flex justify-between my-1">
              Max Wide Banners
              <Input id="AutoWideBannersAmount" value={AutoWideBannersAmount} type="number" onChange={this.handleInputChange} className="w-4" center />
            </div>
          )}
          <span className="font-bold mt-4">Preferences</span>
          <Checkbox label="Auto Link" id="TvDB_AutoLink" isChecked={AutoLink} onChange={this.handleInputChange} className="w-full" />
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
        </React.Fragment>
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.TvDB),
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(TvDBSettings);
