/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */

import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Toast, Toaster, Intent } from '@blueprintjs/core';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import Link from '../../components/Link/Link';
import { ApiLoginType, GlobalAlertType } from '../../core/types/api';
import Button from '../../components/Buttons/Button';
import Input from '../../components/Input/Input';
import Checkbox from '../../components/Input/Checkbox';

const UI_VERSION = uiVersion();

type StateProps = {
  version: string;
  isFetching: boolean;
  firstRun: boolean;
  globalAlert: Array<GlobalAlertType>;
};

type DispatchProps = {
  handleInit: () => void;
  serverVersion: () => void;
  signIn: (payload: ApiLoginType) => void;
};

type Props = StateProps & DispatchProps;

type State = {
  username: string;
  password: string;
  remember: boolean;
};

class LoginPage extends React.Component<Props, State> {
  static propTypes = {
    version: PropTypes.string.isRequired,
    isFetching: PropTypes.bool.isRequired,
    handleInit: PropTypes.func.isRequired,
    serverVersion: PropTypes.func.isRequired,
    signIn: PropTypes.func.isRequired,
    firstRun: PropTypes.bool.isRequired,
    globalAlert: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      remember: false,
    };
  }

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
    const { username: user, password: pass } = this.state;

    if (!user) { return; }

    signIn({
      user,
      pass,
      device: 'web-ui',
    });
  };

  handleHelpButton = (value: string) => {
    if (value === 'discord') window.open('https://discord.gg/vpeHDsg', '_blank');
    else if (value === 'docs') window.open('https://docs.shokoanime.com', '_blank');
  };

  handleOnChange = (event: any) => {
    const tempState = {};
    tempState[event.target.id] = event.target.value;
    this.setState(tempState);
  };

  handleCheckBoxChange = (event: any) => {
    const tempState = {};
    tempState[event.target.id] = event.target.checked;
    this.setState(tempState);
  };

  renderVersion() {
    const {
      version,
      isFetching,
    } = this.props;

    return (
      <div className="text-center text-l pt-2">{isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
        {version} (WebUI {UI_VERSION})
      </div>
    );
  }

  renderToasts() {
    const {
      globalAlert,
    } = this.props;
    if (globalAlert.length === 0) { return null; }

    const toasts: any[] = [];
    let key = 0;

    forEach(globalAlert, (alert) => {
      toasts.push(<Toast key={key} intent={alert.type === 'error' ? Intent.DANGER : Intent.SUCCESS} message={alert.text} />);
      key += 1;
    });

    return <Toaster>{toasts}</Toaster>;
  }

  render() {
    const { firstRun } = this.props;
    const { username, password, remember } = this.state;

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex rounded-lg shadow-lg w-1/2 panel login-panel">
          <div className="w-1/2 h-full login-image rounded-l-lg">
            <div className="flex flex-col justify-center items-center logo h-full rounded-l-lg">
              <span className="text-center text-3xl font-bold">Shoko</span>
              <span className="text-center text-3xl font-bold">Server</span>
              {this.renderVersion()}
            </div>
          </div>
          <div className="w-1/2 h-full flex flex-col">
            <div className="flex-grow px-10 pt-16">
              <form>
                <Input id="username" value={username} label="Username" type="text" placeholder="Username" onChange={this.handleOnChange} onKeyPress={this.handleKeyPress} />
                <Input id="password" value={password} label="Password" type="password" placeholder="Password" onChange={this.handleOnChange} onKeyPress={this.handleKeyPress} />
                <Checkbox id="remember" label="Remember Me" isChecked={remember} onChange={this.handleCheckBoxChange} />
                <Button className="sign-in-button mt-4 py-2 px-4 rounded-lg" onClick={this.handleSignIn}>Sign In</Button>
              </form>
            </div>
            <div className="help flex-none flex p-4">
              <div className="w-3/4 color-accent font-muli font-bold flex items-center ml-6">
                Need help logging in?
              </div>
              <div className="w-1/4">
                <Button className="color-accent mr-2" onClick={() => this.handleHelpButton('discord')}>
                  <FontAwesomeIcon icon={faDiscord} className="text-2xl" />
                </Button>
                <Button className="color-accent mr-2" onClick={() => this.handleHelpButton('docs')}>
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-2xl" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state): StateProps {
  const {
    jmmVersion,
    firstrun,
    fetching,
    globalAlert,
  } = state;

  return {
    globalAlert,
    version: jmmVersion || null,
    isFetching: fetching.serverVersion === true,
    firstRun: firstrun.status && firstrun.status.first_run === true,
  };
}

function mapDispatchToProps(dispatch): DispatchProps {
  return {
    handleInit: () => { dispatch({ type: Events.INIT_STATUS }); },
    serverVersion: () => { dispatch({ type: Events.SERVER_VERSION }); },
    signIn: (payload) => { dispatch({ type: Events.LOGIN, payload }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
