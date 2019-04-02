// @flow
import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import {
  Columns, Container, Hero,
} from 'react-bulma-components';
import {
  Button, Card, Callout, FormGroup, InputGroup, Intent, Toaster, Toast,
} from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import Link from '../../components/Link/Link';
import type { ApiLoginType, GlobalAlertType } from '../../core/types/api';

const UI_VERSION = uiVersion();

type Props = {
  version: string,
  isFetching: boolean,
  handleInit: () => void,
  serverVersion: () => void,
  signIn: (payload: ApiLoginType) => void,
  firstRun: boolean,
  globalAlert: Array<GlobalAlertType>,
}

type State = {
  errorMessage: string | null,
}

class LoginPage extends React.Component<Props, State> {
  static propTypes = {
    version: PropTypes.string,
    isFetching: PropTypes.bool,
    handleInit: PropTypes.func,
    serverVersion: PropTypes.func,
    signIn: PropTypes.func,
    firstRun: PropTypes.bool,
    globalAlert: PropTypes.array,
  };

  componentDidMount() {
    if (this.user) this.user.focus();
    const { handleInit, serverVersion } = this.props;
    handleInit();
    serverVersion();
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSignIn();
    }
  };

  handleSignIn = () => {
    const { signIn } = this.props;
    if (!this.user) { return; }
    const user = this.user.value;
    if (!this.pass) { return; }
    const pass = this.pass.value;
    signIn({
      user,
      pass,
      device: 'web-ui',
    });
  };

  user: ?HTMLInputElement;

  pass: ?HTMLInputElement;

  renderVersion() {
    const { version, isFetching } = this.props;

    return (
      <h4 className="version">{isFetching ? <FontAwesomeIcon icon={faSpinner} spin /> : null }
        {version === null ? '' : version}
        (WebUI {UI_VERSION})
      </h4>
    );
  }

  renderToasts() {
    const { globalAlert } = this.props;
    if (globalAlert.length === 0) { return null; }

    const toasts = [];
    let key = 0;

    forEach(globalAlert, (alert) => {
      toasts.push(<Toast key={key} intent={alert.type === 'error' ? Intent.DANGER : Intent.SUCCESS} message={alert.text} />);
      key += 1;
    });

    return (
      <Toaster>{toasts}</Toaster>
    );
  }

  render() {
    const { firstRun } = this.props;

    return (
      <Hero size="fullheight" className="login-image">
        {this.renderToasts()}
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column size="one-quarter">
                <Card className="login-form">
                  <h2 className="welcome">Welcome to Shoko Server!</h2>
                  {firstRun !== true && this.renderVersion()}
                  {firstRun === true && <Callout className="firstrun-notice" intent="warning">Looks like a first run. Try the <Link to="/firstrun">wizard</Link></Callout>}
                  <FormGroup>
                    <InputGroup onKeyPress={this.handleKeyPress} inputRef={(ref) => { this.user = ref; }} placeholder="Username" />
                  </FormGroup>
                  <FormGroup>
                    <InputGroup type="password" onKeyPress={this.handleKeyPress} inputRef={(ref) => { this.pass = ref; }} placeholder="Password" />
                  </FormGroup>
                  <Button onClick={this.handleSignIn}>Login</Button>
                </Card>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }
}

function mapStateToProps(state) {
  const {
    jmmVersion, firstrun, fetching, globalAlert,
  } = state;

  return {
    globalAlert,
    version: jmmVersion || null,
    isFetching: fetching.serverVersion === true,
    firstRun: firstrun.status && firstrun.status.first_run === true,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleInit: () => { dispatch({ type: Events.INIT_STATUS }); },
    serverVersion: () => { dispatch({ type: Events.SERVER_VERSION }); },
    signIn: (payload) => { dispatch({ type: Events.LOGIN, payload }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
