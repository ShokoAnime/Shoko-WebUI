import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Input from '../../components/Input/Input';
import Footer from './Footer';
import TransitionDiv from '../../components/TransitionDiv';
import { unsetSaved as unsetFirstRunSaved, setAnidbStatus } from '../../core/slices/firstrun';

import type { SettingsAnidbLoginType } from '../../core/types/api/settings';

type State = SettingsAnidbLoginType;

class AniDBAccount extends React.Component<Props, State> {
  state = {
    Username: '',
    Password: '',
  };

  componentDidMount() {
    const { AniDb, resetStatus } = this.props;
    this.setState(AniDb);
    resetStatus();
  }

  handleInputChange = (event: any) => {
    const { saved, resetStatus, unsetSaved } = this.props;
    const { id, value } = event.target;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
    resetStatus();
    if (saved) unsetSaved();
  };

  render() {
    const { status, isFetching, testAnidb } = this.props;
    const { Username, Password } = this.state;

    return (
      <TransitionDiv className="flex flex-col flex-grow justify-center" enterFrom="opacity-0">
        <div className="font-bold text-lg">Adding Your AniDB Account</div>
        <div className="font-mulish mt-5 text-justify">
          Shoko uses AniDB to compare your file hashes with its extensive database to quickly
          figure out and add series to your collection. AniDB also provides additional series
          and episode information that enhances your usage.
        </div>
        <div className="font-mulish mt-4 text-justify">
          An AniDB account is required to use Shoko. <a href="https://anidb.net/" target="_blank" rel="noreferrer" className="color-highlight-2 hover:underline">Click Here</a> to create one.
        </div>
        <div className="flex flex-col my-8">
          <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} />
          <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="mt-6" />
        </div>
        <Footer nextDisabled={Username === '' || Password === ''} saveFunction={() => testAnidb(this.state)} isFetching={isFetching} status={status} />
      </TransitionDiv>
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
  testAnidb: (payload: SettingsAnidbLoginType) => ({ type: Events.FIRSTRUN_TEST_ANIDB, payload }),
  saveSettings: (payload: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload }),
  resetStatus: () => (setAnidbStatus({ type: 'success', text: '' })),
  unsetSaved: () => (unsetFirstRunSaved('anidb-account')),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(AniDBAccount);
