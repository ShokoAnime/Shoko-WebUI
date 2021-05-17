import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { push } from 'connected-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner, faCircleNotch, faTimesCircle, faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import { ApiLoginType, GlobalAlertType } from '../../core/types/api';
import Button from '../../components/Input/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';

const UI_VERSION = uiVersion();

type State = {
  username: string;
  password: string;
  rememberUser: boolean;
};

class LoginPage extends React.Component<Props, State> {
  state = {
    username: '',
    password: '',
    rememberUser: false,
  };

  componentDidMount() {
    const {
      startPollingStatus, serverVersion, skipLogin,
      rememberUser,
    } = this.props;
    startPollingStatus();
    serverVersion();
    if (rememberUser) skipLogin();
  }

  componentDidUpdate() {
    const { initStatus, stopPollingStatus } = this.props;
    if (initStatus.State !== 1) stopPollingStatus();
  }

  componentWillUnmount() {
    const { stopPollingStatus } = this.props;
    stopPollingStatus();
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSignIn();
    }
  };

  handleSignIn = () => {
    const { signIn } = this.props;
    const { username: user, password: pass, rememberUser } = this.state;

    if (!user) { return; }

    signIn({
      user,
      pass,
      device: 'web-ui',
      rememberUser,
    });
  };

  handleHelpButton = (value: string) => {
    if (value === 'discord') window.open('https://discord.gg/vpeHDsg', '_blank');
    else if (value === 'docs') window.open('https://docs.shokoanime.com', '_blank');
  };

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [name]: value }));
  };

  renderVersion() {
    const { version, isFetching } = this.props;

    return (
      <div className="flex flex-grow text-center text-sm font-semibold items-end mb-4">{isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
        {version} (WebUI {UI_VERSION})
      </div>
    );
  }

  render() {
    const {
      initStatus, isFetching, isFetchingLogin,
      toastPosition, openWizard, version,
    } = this.props;
    const { username, password, rememberUser } = this.state;

    return (
      <React.Fragment>
        <ToastContainer
          position={toastPosition}
          autoClose={4000}
          transition={Slide}
          bodyClassName="font-bold font-exo2"
        />
        <div className="flex h-screen w-screen">
          <div className="flex flex-grow login-image" />
          <div className="flex flex-col p-5 mt-16 items-center" style={{ width: '41rem' }}>
            <img src="logo.png" className="w-32" alt="logo" />
            <div className="flex flex-col flex-grow mt-32 w-full px-10">
              {!initStatus?.State && (
                <div className="flex justify-center items-center mt-32">
                  <FontAwesomeIcon icon={faCircleNotch} spin className="color-highlight-2 text-6xl2" />
                </div>
              )}
              {initStatus.State === 1 && (
                <div className="flex flex-col justify-center items-center mt-24">
                  <FontAwesomeIcon icon={faCircleNotch} spin className="color-highlight-2 text-6xl2" />
                  <div className="mt-8 text-3xl">Server is starting. Please wait!</div>
                  <div className="mt-2 text-lg">
                    <span className="font-mulish font-semibold">Status: </span>{initStatus.StartupMessage ?? 'Unknown'}
                  </div>
                </div>
              )}
              {initStatus.State === 2 && (
                <React.Fragment>
                  <div className="flex flex-col">
                    <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} />
                    <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} className="mt-12" />
                  </div>
                  <div className="flex justify-between items-center mt-16">
                    <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={this.handleInputChange} className="flex font-bold text-lg" labelRight />
                    <Button className="bg-color-highlight-1 py-3 px-28 text-lg font-bold" onClick={this.handleSignIn} loading={isFetchingLogin} disabled={isFetching || username === ''}>Log In</Button>
                  </div>
                </React.Fragment>
              )}
              {initStatus.State === 3 && (
                <div className="flex flex-col justify-center items-center overflow-y-auto pb-2">
                  <FontAwesomeIcon icon={faTimesCircle} className="color-danger text-6xl2" />
                  <div className="mt-3 text-3xl">Server startup failed!</div>
                  Check the error message below
                  <div className="mt-2 text-lg break-all overflow-y-auto">{initStatus.StartupMessage ?? 'Unknown'}</div>
                </div>
              )}
              {initStatus.State === 4 && (
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    <div className="font-semibold text-lg">First Time? We&apos;ve All Been There</div>
                    <div className="mt-6 font-mulish text-justify">
                      Before Shoko can get started indexing your anime collection, you&apos;ll
                      need to go through our <span className="color-highlight-1">First Time Wizard </span>
                      and set everything up. Don&apos;t worry, it&apos;s pretty easy and only
                      takes a couple of minutes.
                    </div>
                    <div className="mt-6 font-mulish">
                      Click <span className="color-highlight-1">Continue</span> below to proceed.
                    </div>
                  </div>
                  <div className="flex justify-center items-center flex-grow mt-32">
                    <Button onClick={() => openWizard()} className="flex bg-color-highlight-1 px-24 py-5 font-semibold">Continue</Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between w-full px-10">
              <div className="flex items-center">
                Server Version: {isFetching ? <FontAwesomeIcon icon={faCircleNotch} spin className="mx-2 color-highlight-2" /> : `${version} `}
                | UI Version: {UI_VERSION}
              </div>
              <div className="flex items-center">
                Get Support:
                <Button className="color-highlight-1 ml-4 text-xl2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
                  <FontAwesomeIcon icon={faDiscord} />
                </Button>
                <Button className="color-highlight-1 ml-4 text-xl2" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
                  <FontAwesomeIcon icon={faGlobe} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  globalAlert: state.globalAlert as Array<GlobalAlertType>,
  version: state.jmmVersion,
  isFetching: state.fetching.serverVersion,
  isFetchingLogin: state.fetching.login,
  initStatus: state.firstrun.status,
  rememberUser: state.apiSession.rememberUser,
  apikey: state.apiSession.apikey,
  toastPosition: state.webuiSettings.webui_v2.toastPosition,
});

const mapDispatch = {
  startPollingStatus: () => ({ type: Events.START_API_POLLING, payload: { type: 'server-status' } }),
  stopPollingStatus: () => ({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } }),
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
  signIn: (payload: ApiLoginType & { rememberUser: boolean }) => (
    { type: Events.AUTH_LOGIN, payload }
  ),
  skipLogin: () => (push({ pathname: '/main' })),
  openWizard: () => (push({ pathname: '/firstrun' })),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LoginPage);
