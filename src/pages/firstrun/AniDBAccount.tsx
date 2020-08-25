import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Input from '../../components/Input/Input';
import Footer from './Footer';

import type { SettingsAnidbLoginType } from '../../core/types/api/settings';

type State = SettingsAnidbLoginType;

class AniDBAccount extends React.Component<Props, State> {
  state = {
    Username: '',
    Password: '',
  };

  componentDidMount() {
    const { AniDb } = this.props;
    this.setState(AniDb);
  }

  handleInputChange = (event: any) => {
    const { id, value } = event.target;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
  };

  render() {
    const { status, isFetching, testAnidb } = this.props;
    const { Username, Password } = this.state;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Adding Your AniDB Account</div>
          <div className="font-muli mt-5 text-justify">
            Shoko uses AniDB to compare your file hashes with its extensive database to quickly
            figure out and add series to your collection. AniDB also provides additional series
            and episode information that enhances your usage.
          </div>
          <div className="font-muli mt-2 text-justify">
            An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="color-accent-secondary hover:underline">Click Here</a> to create one.
          </div>
          <div className="flex flex-col w-1/2 mt-3">
            <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
            <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
          </div>
          <div className={cx(['flex ', status.type === 'error' ? 'color-danger' : 'color-accent'])}>
            {status.text}
          </div>
        </div>
        <Footer prevTabKey="local-account" nextDisabled={Username === '' || Password === ''} saveFunction={() => testAnidb(this.state)} isFetching={isFetching} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  AniDb: state.localSettings.AniDb,
  status: state.firstrun.anidbStatus,
  isFetching: state.fetching.firstrunAnidb,
});

const mapDispatch = {
  testAnidb: (payload: SettingsAnidbLoginType) => ({ type: Events.FIRSTRUN_TEST_ANIDB, payload }),
  saveSettings: (payload: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBAccount);
