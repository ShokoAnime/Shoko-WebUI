import 'isomorphic-fetch';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import { ApiLoginType, GlobalAlertType } from '../../core/types/api';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';
import Link from '../../components/Link/Link';
import AlertContainer from '../../components/AlertContainer';

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
    const { handleInit, serverVersion } = this.props;
    handleInit();
    serverVersion();
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
    const {
      version,
      isFetching,
    } = this.props;

    return (
      <div className="text-center text-sm font-semibold mt-4">{isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
        {version} (WebUI {UI_VERSION})
      </div>
    );
  }

  render() {
    const { initStatus, isFetching, isFetchingLogin } = this.props;
    const { username, password, rememberUser } = this.state;

    return (
      <div className="flex flex-grow items-center justify-center h-screen">
        <AlertContainer />
        <div className="flex rounded-lg shadow-lg login-panel">
          <div className="login-image rounded-l-lg">
            <div className="flex flex-col justify-center items-center logo h-full rounded-l-lg text-center text-3xl2 font-bold">
              <span>Shoko</span>
              <span>Server</span>
              {this.renderVersion()}
            </div>
          </div>
          <div className="flex flex-col flex-grow justify-between">
            <div className="px-10 flex flex-grow flex-col justify-center">
              {initStatus.State === 4 && (
                <div className="border-sm px-4 py-3 rounded relative text-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  Looks like a first run. Try the <Link to="/firstrun"><span className="color-accent-secondary">wizard</span></Link>
                </div>
              )}
              <div className="flex flex-col">
                <Input autoFocus id="username" value={username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} className="py-2" />
                <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} onKeyPress={this.handleKeyPress} className="py-2" />
                <Checkbox id="rememberUser" label="Remember Me" isChecked={rememberUser} onChange={this.handleInputChange} className="flex" labelRight />
                <div className="flex justify-between items-center mt-4">
                  <Button className="bg-color-accent py-2 px-5 rounded text-xs" onClick={this.handleSignIn} loading={isFetchingLogin} disabled={isFetching || initStatus.State === 4}>Sign In</Button>
                  <Link to="/"><span className="color-accent-secondary font-muli font-bold text-xs">Create New Account</span></Link>
                </div>
              </div>
            </div>
            <div className="help flex px-4 py-2 rounded-br-lg justify-between">
              <div className="color-accent font-muli font-bold text-xs flex items-center ml-6">
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
});

const mapDispatch = {
  handleInit: () => ({ type: Events.FIRSTRUN_INIT_STATUS }),
  serverVersion: () => ({ type: Events.SERVER_VERSION }),
  signIn: (payload: ApiLoginType & { rememberUser: boolean }) => (
    { type: Events.AUTH_LOGIN, payload }
  ),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(LoginPage);
