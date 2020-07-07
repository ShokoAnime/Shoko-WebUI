import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import Checkbox from '../../../components/Input/Checkbox';
import Select from '../../../components/Input/Select';
import Button from '../../../components/Buttons/Button';

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];

class TraktTab extends React.Component<Props> {
  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'TraktTv', newSettings: { [id]: value } });
  };

  renderTraktCode() {
    const { trakt } = this.props;
    const { usercode, url } = trakt;
    const { fetching, getTraktCode } = this.props;
    if (usercode === '') {
      return (
        <div className="flex w-3/5 justify-between items-center my-1">
          Trakt Code
          <Button onClick={getTraktCode} className="bg-color-accent-secondary px-2 py-1 text-sm">
            {fetching ? 'Requesting...' : 'Get Trakt Code'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-between my-2 items-center">
        <span className="w-64">Trakt Code: <span className="font-semibold">{usercode}</span></span>
        <span>
          <span className="color-accent-secondary"><a href={url} rel="noopener noreferrer" target="_blank">{url}</a></span><br />
          You have approximately 10 minutes to visit the URL provided and enter the code,
          server is polling for access token, it will be acquired automatically.
        </span>
      </div>
    );
  }

  render() {
    const {
      Enabled, TokenExpirationDate, UpdateFrequency,
    } = this.props;

    const updateFrequencyOptions: Array<any> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]}>{item[1]}</option>);
    });

    return (
      <React.Fragment>
        <span className="font-bold">Trakt.TV Options</span>
        <Checkbox label="Enabled" id="Enabled" isChecked={Enabled} onChange={this.handleInputChange} className="w-3/5" />
        {
          TokenExpirationDate === ''
            ? this.renderTraktCode()
            : (
              <div className="flex justify-between my-1">
                Token valid until:
                <span className="text-right">{moment(TokenExpirationDate, 'X').format('MMM Do YYYY, h:mm A')}</span>
              </div>
            )
        }
        <div className="flex w-3/5 justify-between my-1">
          Automatically Update Data
          <Select id="UpdateFrequency" value={UpdateFrequency} onChange={this.handleInputChange}>
            {updateFrequencyOptions}
          </Select>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.TraktTv),
  fetching: state.fetching.trakt_code,
  trakt: state.misc.trakt,
});

const mapDispatch = {
  getTraktCode: () => ({ type: Events.SETTINGS_GET_TRAKT_CODE }),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(TraktTab);
