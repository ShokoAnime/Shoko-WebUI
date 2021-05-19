import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Checkbox from '../../../components/Input/Checkbox';
import InputSmall from '../../../components/Input/InputSmall';
import TransitionDiv from '../../../components/TransitionDiv';

class MovieDBTab extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'MovieDb', newSettings: { [id]: value } });
  };

  render() {
    const {
      AutoFanart, AutoPosters,
      AutoFanartAmount, AutoPostersAmount,
    } = this.props;

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
      </TransitionDiv>
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

export default connector(MovieDBTab);
