// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';

type Props = {
  component: React.Component<any>,
  isAuthenticated: boolean,
}

class AuthenticatedRoute extends React.Component<Props> {
  static propTypes = {
    component: PropTypes.object,
    isAuthenticated: PropTypes.bool,
  };

  renderComponent = (props) => {
    const { isAuthenticated, component: Component } = this.props;
    if (!isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { from: props.location },
          }}
        />);
    }

    return <Component {...props} />;
  };

  render() {
    const { component, ...rest } = this.props;
    return (
      <Route {...rest} render={this.renderComponent} />
    );
  }
}

function mapStateToProps(state) {
  const { apiSession } = state;

  return {
    isAuthenticated: apiSession && apiSession.apikey,
  };
}

export default connect(mapStateToProps, () => ({}))(AuthenticatedRoute);
