import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import { SettingsMoviedbType } from '../../../core/reducers/settings/Server';
import Checkbox from '../../../components/Input/Checkbox';
import Input from '../../../components/Input/Input';

type State = SettingsMoviedbType;

class MovieDBTab extends React.Component<Props, State> {
  state = {
    AutoFanart: true,
    AutoFanartAmount: 10,
    AutoPosters: true,
    AutoPostersAmount: 10,
  };

  componentDidMount() {
    const { oldSettings } = this.props;
    this.setState(Object.assign({}, oldSettings));
  }

  componentWillUnmount() {
    const { oldSettings, saveSettings } = this.props;
    saveSettings({ context: 'MovieDb', original: oldSettings, changed: this.state });
  }

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign(prevState, { [name]: value }));
  };

  render() {
    const {
      AutoFanart, AutoPosters,
      AutoFanartAmount, AutoPostersAmount,
    } = this.state;

    return (
      <React.Fragment>
        <span className="font-bold">The MovieDB Options</span>
        <div className="flex w-3/5 justify-between mt-2">
          Fanart
          <Checkbox id="AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Max Fanart
          <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-8" />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Posters
          <Checkbox id="AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} />
        </div>
        <div className="flex w-3/5 justify-between mt-1">
          Max Posters
          <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-8" />
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  oldSettings: state.settings.server.MovieDb,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(MovieDBTab);
