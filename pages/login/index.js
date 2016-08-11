import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import s from './styles.css';
import cx from 'classnames';
import 'isomorphic-fetch';
import store from '../../core/store';
import { apiSession, jmmVersionAsync } from '../../core/actions';
import history from '../../core/history';

class LoginPage extends React.Component {
    constructor() {
        super();
        this.handleSignIn = this.handleSignIn.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        const container = document.getElementById('app-container');
        container.style.height = '100%';

        jmmVersionAsync();
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleSignIn();
        }
    }

    handleSignIn() {
        let user = this.refs.user.value;
        fetch('/api/auth', {
            method: 'POST',
            body: JSON.stringify({user: this.refs.user.value, pass: this.refs.pass.value, device: 'web-ui'}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json()
        }).then(function (json) {
            if (json.apikey) {
                store.dispatch(apiSession({'apikey': json.apikey, 'username': user}));
                history.push({
                    pathname: '/dashboard',
                });
            }
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        })
    }

    render() {
        const { version, isFetching } = this.props;
        return (
            <div className={s['wrapper']}>
                <div className={s['wrapper-inner']}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className={cx("col-md-3 col-md-offset-3", s['left-panel'])}>
                                <h1>JMM Server</h1>
                                <h4>{isFetching?<i className="fa fa-refresh fa-spin"/>:null}{version instanceof Error?`Error: ${version.message}`:version} (WebUI {__VERSION__})</h4>
                                <h2>Welcome Back!</h2>
                                <h2>Input your user information to login into JMM Server!</h2>
                            </div>
                            <div className={cx("col-md-3", s['right-panel'])}>
                                <h2>Sign In</h2>
                                <div className="form-group">
                                    <label className="sr-only" htmlFor="username">Username</label>
                                    <input type="text" ref="user" className="form-control"
                                           id="username" placeholder="Username" onKeyPress={this.handleKeyPress}/>
                                </div>
                                <div className="form-group">
                                    <label className="sr-only" htmlFor="password">Password</label>
                                    <input ref="pass" type="password" className="form-control" id="password"
                                           placeholder="Password" onKeyPress={this.handleKeyPress}/>
                                </div>
                                <button type="button" onClick={this.handleSignIn}
                                        className="btn btn-primary btn-lg btn-block">Sign In
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
    const { apiSession, jmmVersion } = state;

    return {
        version: jmmVersion.version || null,
        isFetching: jmmVersion.isFetching
    }
}

export default connect(mapStateToProps)(LoginPage)