import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Checkbox from '../../../components/Input/Checkbox';

class GeneralSettings extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'AniDb', newSettings: { [id]: value } });
  };

  render() {
    const { notifications } = this.props;

    return (
      <FixedPanel title="General">
        <span className="font-bold mt-2">Web UI</span>
        <div className="flex justify-between my-1">
          Theme
          <span className="color-accent font-bold">Shoko Modern</span>
        </div>
        <Checkbox label="Global Notifications" id="notifications" isChecked={notifications} onChange={this.handleInputChange} className="w-full" />
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.webuiSettings),
});

const mapDispatch = {
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_WEBUI, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(GeneralSettings);
