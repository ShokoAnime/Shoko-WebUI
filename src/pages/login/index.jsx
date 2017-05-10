// @flow
import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import cx from 'classnames';
import s from './styles.css';
import store from '../../core/store';
import { apiSession } from '../../core/actions';
import history from '../../core/history';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import Link from '../../components/Link/Link';

const UI_VERSION = uiVersion();

class LoginPage extends React.Component {
  static propTypes = {
    version: PropTypes.string,
    isFetching: PropTypes.bool,
    handleInit: PropTypes.func,
    serverVersion: PropTypes.func,
    firstRun: PropTypes.bool,
  };

  constructor() {
    super();
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.state = {
      errorMessage: null,
    };
  }

  componentDidMount() {
    document.title = `Shoko Server Web UI ${UI_VERSION}`;
    this.user.focus();
    this.props.handleInit();
    this.props.serverVersion();
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSignIn();
    }
  }

  handleSignIn() {
    const user = this.user.value;
    this.setState({ errorMessage: null });
    // eslint-disable-next-line no-undef
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        user: this.user.value,
        pass: this.pass.value,
        device: 'web-ui',
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok === false) {
          let errorMessage = null;
          if (response.status === 417) {
            errorMessage = 'Invalid Username or Password';
          } else {
            errorMessage = `${response.status}: ${response.statusText}`;
          }
          this.setState({ errorMessage });
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((json) => {
        if (json.apikey) {
          store.dispatch(apiSession({ apikey: json.apikey, username: user }));
          history.push('/dashboard');
        } else {
          this.setState({ errorMessage: 'Unknown response!' });
        }
      });
  }

  renderVersion() {
    const { version, isFetching } = this.props;

    return (
      <h4>{isFetching ? <i className="fa fa-refresh fa-spin" /> : null }
        {version === null ? '' : version}
        (WebUI {UI_VERSION})
      </h4>
    );
  }

  render() {
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
                <h2>Input your user information to login into Shoko Server!</h2>
              </div>
              <div className={cx('col-md-3', s['right-panel'])}>
                <Alert
                  bsStyle="danger"
                  className={cx({ hidden: errorMessage === null })}
                >{errorMessage}
                </Alert>
                {firstRun === true && <Alert bsStyle="warning"> Looks like a first run. Try the <Link to="/firstrun">wizard</Link></Alert>}
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
  }
}

function mapStateToProps(state) {
  const { jmmVersion, firstrun, fetching } = state;

  return {
    version: jmmVersion || null,
    isFetching: fetching.serverVersion === true,
    firstRun: firstrun.status && firstrun.status.first_run === true,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleInit: () => { dispatch({ type: Events.INIT_STATUS }); },
    serverVersion: () => { dispatch({ type: Events.SERVER_VERSION }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
