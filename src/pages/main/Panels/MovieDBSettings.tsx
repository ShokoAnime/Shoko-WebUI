import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';
import Input from '../../../components/Input/Input';

class MovieDBSettings extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (value) {
      saveSettings({ context: 'MovieDb', newSettings: { [id]: value } });
    }
  };

  render() {
    const {
      AutoFanart, AutoPosters,
      AutoFanartAmount, AutoPostersAmount,
    } = this.props;

    return (
      <FixedPanel title="MovieDB">
        <span className="font-bold mt-2">The MovieDB Options</span>
        <div className="flex justify-between mt-2">
          Fanart
          <Checkbox id="AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} />
        </div>
        <div className="flex justify-between mt-1">
          Max Fanart
          <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-4 mr-1" />
        </div>
        <div className="flex justify-between mt-1">
          Posters
          <Checkbox id="AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} />
        </div>
        <div className="flex justify-between mt-1">
          Max Posters
          <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-4 mr-1" />
        </div>
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.MovieDb),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(MovieDBSettings);
