import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';

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

        <div className="font-bold">Download Options</div>
        <Checkbox label="Fanart" id="MovieDB_AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} className="mt-1" />
        {AutoFanart && (
          <div className="flex justify-between mt-1">
            Max Fanart
            <InputSmall id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-10 text-center px-2" />
          </div>
        )}
        <Checkbox label="Posters" id="MovieDB_AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} className="mt-1" />
        {AutoPosters && (
          <div className="flex justify-between mt-1">
            Max Posters
            <InputSmall id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-10 text-center px-2" />
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
