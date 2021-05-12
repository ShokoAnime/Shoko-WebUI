import 'isomorphic-fetch';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { push } from 'connected-react-router';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner, faQuestionCircle, faCircleNotch, faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import { ApiLoginType, GlobalAlertType } from '../../core/types/api';
import Button from '../../components/Buttons/Button';
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
      toastPosition, openWizard,
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
        <div className="flex flex-grow items-center justify-center h-screen">
          <div className="flex rounded-lg shadow-lg login-panel">
            <div className="login-image rounded-l-lg">
              <div className="flex flex-col justify-center items-center logo h-full rounded-l-lg text-center font-extrabold">
                <div className="flex flex-col flex-grow justify-end mt-4">
                  <div className="text-4xl2">
                    <span className="text-5xl2">S</span>HOKO
                  </div>
                  <div className="color-accent text-5xl -mt-10">
                    <span className="text-6xl2">S</span>ERVER
                  </div>
                </div>
                {this.renderVersion()}
              </div>
            </div>
            <div className="flex flex-col flex-grow justify-between">
              <div className="px-10 flex flex-grow flex-col justify-center overflow-y-auto">
                {!initStatus?.State && (
                  <div className="flex justify-center items-center">
                    <FontAwesomeIcon icon={faCircleNotch} spin className="color-accent-secondary text-5xl" />
                  </div>
                )}
                {initStatus.State === 1 && (
                  <div className="flex flex-col justify-center items-center">
                    <FontAwesomeIcon icon={faCircleNotch} spin className="color-accent-secondary text-5xl" />
                    <div className="mt-8 text-2xl2">Server is starting. Please wait!</div>
                    <div className="mt-2 text-sm">
                      <span className="font-mulish font-semibold">Status: </span>{initStatus.StartupMessage ?? 'Unknown'}
                    </div>
                  </div>
                )}
                {initStatus.State === 2 && (
                  <div className="flex flex-col">
                    <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} className="py-2" />
                    <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} className="py-2" />
                    <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={this.handleInputChange} className="flex" labelRight />
                    <div className="flex mt-4">
                      <Button className="bg-color-accent py-2 px-5 rounded text-xs" onClick={this.handleSignIn} loading={isFetchingLogin} disabled={isFetching || username === ''}>Sign In</Button>
                    </div>
                  </div>
                )}
                {initStatus.State === 3 && (
                  <div className="flex flex-col justify-center items-center overflow-y-auto pt-4 pb-2">
                    <FontAwesomeIcon icon={faTimesCircle} className="color-danger text-5xl" />
                    <div className="mt-3 text-2xl2">Server startup failed!</div>
                    Check the error message below
                    <div className="mt-1 text-xs break-all overflow-y-auto">{initStatus.StartupMessage ?? 'Unknown'}</div>
                  </div>
                )}
                {initStatus.State === 4 && (
                  <div className="flex flex-col flex-grow py-8">
                    <div className="flex flex-col">
                      <div className="font-bold text-xl">First Time? We&apos;ve All Been There</div>
                      <div className="mt-6 font-mulish text-justify">
                        Before Shoko can get started indexing your anime collection, you&apos;ll
                        need to go through our <span className="font-bold">First Time Wizard </span>
                        and set everything up. Don&apos;t worry, it&apos;s pretty easy and only
                        takes a couple of minutes.
                      </div>
                      <div className="mt-6 font-mulish">
                        Click <span className="font-bold">Continue</span> below to proceed.
                      </div>
                    </div>
                    <div className="flex justify-center items-center flex-grow mt-8">
                      <Button onClick={() => openWizard()} className="flex bg-color-accent px-4 py-2 font-semibold">CONTINUE</Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="help flex px-4 py-2 rounded-br-lg justify-between">
                <div className="color-accent font-mulish font-bold text-xs flex items-center ml-6">
                  Need help logging in?
                </div>
                <div className="flex">
                  <Button className="color-accent mr-5" onClick={() => this.handleHelpButton('discord')}>
                    <FontAwesomeIcon icon={faDiscord} className="text-xl" />
                  </Button>
                  <Button className="color-accent mr-6" onClick={() => this.handleHelpButton('docs')}>
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-xl" />
                  </Button>
                </div>
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
  toastPosition: state.webuiSettings.v3.toastPosition,
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
