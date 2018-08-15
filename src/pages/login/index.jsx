// @flow
import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { forEach } from 'lodash';
import { Columns, Container, Hero } from 'react-bulma-components';
import {
  Button, Card, FormGroup, InputGroup, Intent, Toaster, Toast,
} from '@blueprintjs/core';
import s from './styles.css';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import type { ApiLoginType } from '../../core/types/api';

const UI_VERSION = uiVersion();

type Props = {
  version: string,
  isFetching: boolean,
  handleInit: () => void,
  serverVersion: () => void,
  signIn: (payload: ApiLoginType) => void,
  firstRun: boolean,
  globalAlert: [],
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

  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: null,
    };
  }

  componentDidMount() {
    document.title = `Shoko Server Web UI ${UI_VERSION}`;
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
    this.setState({ errorMessage: null });
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
      <h4>{isFetching ? <i className="fa fa-refresh fa-spin" /> : null }
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
      toasts.push(<Toast key={key} intent={alert.type === 'error'?Intent.DANGER:Intent.SUCCESS} message={alert.text} />);
      key += 1;
    });

    return (
      <Toaster>{toasts}</Toaster>
    );
  }

  render() {
    const { firstRun } = this.props;

    return (
      <Hero size="fullheight" className={s['login-image']}>
        {this.renderToasts()}
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column size="one-quarter">
                <Card className={s['login-form']}>
                  <h2>You know what to do..</h2>
                  {firstRun !== true && this.renderVersion()}
                  <FormGroup>
                    <InputGroup onKeyPress={this.handleKeyPress} inputRef={(ref) => { this.user = ref; }} placeholder="Username" />
                  </FormGroup>
                  <FormGroup>
                    <InputGroup onKeyPress={this.handleKeyPress} inputRef={(ref) => { this.pass = ref; }} placeholder="Password" />
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

  /*render() {
    const { firstRun } = this.props;
    const { errorMessage } = this.state;

    return (
      <div className={s.wrapper}>
        <div className={s['wrapper-inner']}>
          <div className="container-fluid">
            <div className="row">
              <div className={cx('col-md-3 col-md-offset-3', s['left-panel'])}>
                <h1>Shoko Server</h1>
                {firstRun !== true && this.renderVersion()}
                <h2>Welcome Back!</h2>
                <h3>Input your user information to login into Shoko Server!</h3>
                <div className={s.spacer} />
                <h3 className="web-ui-notice">Need additional help? Check <a href="https://docs.shokoanime.com/server/config/settings.html#shoko-webui" target="_blank" rel="noopener noreferrer">Shoko Docs</a></h3>
              </div>
              <div className={cx('col-md-3', s['right-panel'])}>
                <Alert
                  onDismiss={() => {}}
                  bsStyle="danger"
                  className={cx({ hidden: errorMessage === null })}
                >{errorMessage}
                </Alert>
                {firstRun === true && <Alert onDismiss={() => {}} bsStyle="warning"> Looks like a first run. Try the <Link to="/firstrun">wizard</Link></Alert>}
                <h2>Sign In</h2>
                <div className="form-group">
                  <label className="sr-only" htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Username"
                    ref={(c) => { this.user = c; }}
                    onKeyPress={this.handleKeyPress}
                  />
                </div>
                <div className="form-group">
                  <label className="sr-only" htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    onKeyPress={this.handleKeyPress}
                    ref={(c) => { this.pass = c; }}
                  />
                </div>
                <button
                  type="button"
                  onClick={this.handleSignIn}
                  className="btn btn-primary btn-lg btn-block"
                >Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }*/
}

function mapStateToProps(state) {
  const { jmmVersion, firstrun, fetching, globalAlert } = state;

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
