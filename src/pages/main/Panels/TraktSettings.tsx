import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Button from '../../../components/Buttons/Button';
import Checkbox from '../../../components/Input/Checkbox';
import Select from '../../../components/Input/Select';

import { setItem as setMiscItem } from '../../../core/slices/misc';

const updateFrequencyType = [
  [1, 'Never'],
  [2, 'Every 6 Hours'],
  [3, 'Every 12 Hours'],
  [4, 'Every 24 Hours'],
  [5, 'Once a Week'],
  [6, 'Once a Month'],
];

class TraktSettings extends React.Component<Props> {
  componentDidMount = () => {
    const { clearTrakt } = this.props;
    clearTrakt();
  };

  handleInputChange = (event: any) => {
    const { saveSettings } = this.props;
    const { id } = event.target;
    const propId = id.replace('Trakt_', '');
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    saveSettings({ context: 'TraktTv', newSettings: { [propId]: value } });
  };

  renderTraktCode() {
    const { trakt } = this.props;
    const { usercode, url } = trakt;
    const { fetching, getTraktCode } = this.props;
    if (usercode === '') {
      return (
        <div className="flex justify-between items-center my-1">
          Trakt Code
          <Button onClick={() => getTraktCode()} className="bg-color-accent-secondary px-2 py-1 text-xs">
            {fetching ? 'Requesting...' : 'Get Code'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex justify-between my-1 items-center">
        <div className="flex">
          Trakt Code:<span className="font-bold ml-1">{usercode}</span>
        </div>
        <a href={url} rel="noopener noreferrer" target="_blank" className="color-accent-secondary hover:underline">Click here to activate</a>
      </div>
    );
  }

  render() {
    const {
      Enabled, TokenExpirationDate, UpdateFrequency,
      isFetching,
    } = this.props;

    const updateFrequencyOptions: Array<any> = [];

    updateFrequencyType.forEach((item) => {
      updateFrequencyOptions.push(<option value={item[0]} key={item[0]}>{item[1]}</option>);
    });

    return (
      <FixedPanel title="Trakt" isFetching={isFetching}>
        <Checkbox label="Enabled" id="Trakt_Enabled" isChecked={Enabled} onChange={this.handleInputChange} className="mt-0 mb-1" />
        {Enabled && (
          TokenExpirationDate === ''
            ? this.renderTraktCode()
            : (
              <div className="flex justify-between my-1">
                Token valid until:
                <span className="text-right">{moment(TokenExpirationDate, 'X').format('MMM Do YYYY, h:mm A')}</span>
              </div>
            )
        )}
        {Enabled && TokenExpirationDate !== '' && (
          <div className="flex justify-between my-1">
            Automatically Update Data
            <Select id="UpdateFrequency" value={UpdateFrequency} onChange={this.handleInputChange}>
              {updateFrequencyOptions}
            </Select>
          </div>
        )}
      </FixedPanel>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.localSettings.TraktTv),
  fetching: state.fetching.trakt_code,
  trakt: state.misc.trakt,
  isFetching: state.fetching.settings,
});

const mapDispatch = {
  getTraktCode: () => ({ type: Events.SETTINGS_GET_TRAKT_CODE }),
  saveSettings: (value: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload: value }),
  clearTrakt: () => (setMiscItem({ trakt: { usercode: '', url: '' } })),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(TraktSettings);
