import 'isomorphic-fetch';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import cx from 'classnames';
import s from './styles.css';
import store from '../../core/store';
import { apiSession, jmmVersionAsync } from '../../core/actions';
import history from '../../core/history';

// eslint-disable-next-line no-undef
const UI_VERSION = __VERSION__;

class LoginPage extends React.Component {
  static propTypes = {
    version: PropTypes.string,
    isFetching: PropTypes.bool,
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
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${UI_VERSION}`;
    this.user.focus();

    jmmVersionAsync();
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

  render() {
    const { version, isFetching } = this.props;
    const { errorMessage } = this.state;
    return (
      <div className={s.wrapper}>
        <div className={s['wrapper-inner']}>
          <div className="container-fluid">
            <div className="row">
              <div className={cx('col-md-3 col-md-offset-3', s['left-panel'])}>
                <h1>Shoko Server</h1>
                <h4>{isFetching ? <i className="fa fa-refresh fa-spin" /> : null }
                  {version instanceof Error ? `Error: ${version.message}` : version}
                  (WebUI {UI_VERSION})</h4>
                <h2>Welcome Back!</h2>
                <h2>Input your user information to login into Shoko Server!</h2>
              </div>
              <div className={cx('col-md-3', s['right-panel'])}>
                <Alert
                  bsStyle="danger"
                  className={cx({ hidden: errorMessage === null })}
                >{errorMessage}</Alert>
                <h2>Sign In</h2>
                <div className="form-group">
                  <label className="sr-only" htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username" placeholder="Username"
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
                >Sign In</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { jmmVersion } = state;

  return {
    version: jmmVersion.version || null,
    isFetching: jmmVersion.isFetching,
  };
}

export default connect(mapStateToProps)(LoginPage);
