import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { setSaved as setFirstRunSaved } from '../../core/slices/firstrun';
import { initialState as SettingsState } from '../../core/slices/serverSettings';
import type { SettingsAnidbType } from '../../core/types/api/settings';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Input/Input';
import Footer from './Footer';

type State = SettingsAnidbType;

class AniDBAccount extends React.Component<Props, State> {
  state = SettingsState.AniDb;

  componentDidMount() {
    const { AniDb } = this.props;
    this.setState(AniDb);
  }

  handleInputChange = (event: any) => {
    const { id } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
  };

  handleSave = () => {
    const { setSaved, saveSettings } = this.props;
    saveSettings({ context: 'AniDb', newSettings: this.state });
    setSaved('anidb-account');
  };

  handleTest = () => {
    const { testAnidb } = this.props;
    this.handleSave();
    testAnidb();
  };

  render() {
    const { saved, status, isFetching } = this.props;
    const { Username, Password, ClientPort } = this.state;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Adding Your AniDB Account</div>
          <div className="font-muli mt-5">
            Shoko uses AniDB to compare your file hashes with its extensive database to quickly
            figure out and add series to your collection. AniDB also provides additional series
            and episode information that enhances your usage.
          </div>
          <div className="font-muli mt-2">
            An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="color-accent-secondary">Click Here</a> to create one.
          </div>
          <div className="flex flex-col w-1/2 mt-3">
            <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
            <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
            <Input id="ClientPort" value={ClientPort} label="Port" type="text" placeholder="Port" onChange={this.handleInputChange} className="py-2" />
          </div>
          <div className="flex mt-4 items-center">
            <Button onClick={() => this.handleTest()} className="bg-color-accent-secondary py-2 px-3 rounded mr-4" disabled={isFetching}>Test</Button>
            {isFetching ? (
              <div>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Testing...
              </div>
            ) : (
              <div className={cx(['flex ', status.type === 'error' ? 'color-danger' : 'color-accent'])}>
                {status.text}
              </div>
            )}
          </div>
        </div>
        <Footer prevTabKey="local-account" nextTabKey="community-sites" nextDisabled={!saved} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  AniDb: state.localSettings.AniDb,
  status: state.firstrun.anidbStatus,
  isFetching: state.fetching.firstrunAnidb,
  saved: state.firstrun.saved['anidb-account'],
});

const mapDispatch = {
  testAnidb: () => ({ type: Events.FIRSTRUN_TEST_ANIDB }),
  saveSettings: (payload: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload }),
  setSaved: (value: string) => (setFirstRunSaved(value)),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBAccount);
