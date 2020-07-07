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
        <span className="font-bold mt-2">Download Options</span>
        <Checkbox label="Fanart" id="AutoFanart" isChecked={AutoFanart} onChange={this.handleInputChange} />
        {AutoFanart && (
          <div className="flex justify-between my-1">
            Max Fanart
            <Input id="AutoFanartAmount" value={AutoFanartAmount} type="number" onChange={this.handleInputChange} className="w-4 mr-1" />
          </div>
        )}
        <Checkbox label="Posters" id="AutoPosters" isChecked={AutoPosters} onChange={this.handleInputChange} />
        {AutoPosters && (
          <div className="flex justify-between my-1">
            Max Posters
            <Input id="AutoPostersAmount" value={AutoPostersAmount} type="number" onChange={this.handleInputChange} className="w-4 mr-1" />
          </div>
        )}
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
