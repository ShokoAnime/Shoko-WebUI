import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import Input from '../../../components/Input/Input';

type State = {
  AutoFanartAmount: number;
  AutoPostersAmount: number;
};

class MovieDBSettings extends React.Component<Props, State> {
  state = {
    AutoFanartAmount: 10,
    AutoPostersAmount: 10,
  };

  componentDidMount = () => {
    const { AutoFanartAmount, AutoPostersAmount } = this.props;
    this.setState({ AutoFanartAmount, AutoPostersAmount });
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const propId = id.replace('MovieDB_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (event.target.type === 'number') {
      this.setState(prevState => Object.assign({}, prevState, { [propId]: value }));
    }
    if (value !== '') {
      saveSettings({ context: 'MovieDb', newSettings: { [propId]: value } });
    }
  };

  render() {
    const { AutoFanart, AutoPosters, isFetching } = this.props;
    const { AutoFanartAmount, AutoPostersAmount } = this.state;

    return (
      <FixedPanel title="MovieDB" isFetching={isFetching}>
        <span className="font-extrabold">Download Options</span>
        <Checkbox label="Fanart" id="MovieDB_AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} />
        {AutoFanart && (
          <div className="flex justify-between my-1">
            Max Fanart
            <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-4" center />
          </div>
        )}
        <Checkbox label="Posters" id="MovieDB_AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} />
        {AutoPosters && (
          <div className="flex justify-between my-1">
            Max Posters
            <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-4" center />
          </div>
        )}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.MovieDb),
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(MovieDBSettings);
