import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Input from '../../../components/Input/Input';

class AniDBLoginSettings extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'LogRotator', newSettings: { [id]: value } });
  };

  render() {
    const {
      Username, Password, ClientPort,
      AVDumpKey, AVDumpClientPort,
    } = this.props;

    return (
      <FixedPanel title="AniDB Login">
        <div className="flex justify-between my-1">
          Username
          <Input id="Username" value={Username} type="text" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          Password
          <Input id="Password" value={Password} type="password" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          Port
          <Input id="ClientPort" value={ClientPort} type="text" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          AvDump Key
          <Input id="AVDumpKey" value={AVDumpKey} type="password" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
        <div className="flex justify-between my-1">
          AvDump Port
          <Input id="AVDumpClientPort" value={AVDumpClientPort} type="text" onChange={this.handleInputChange} className="w-32 mr-1" />
        </div>
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.AniDb),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBLoginSettings);
