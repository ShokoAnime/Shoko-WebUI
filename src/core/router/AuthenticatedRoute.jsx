// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';

import type { Node } from 'react';

type Props = {
  component: Node,
  isAuthenticated: boolean,
}

class AuthenticatedRoute extends React.Component<Props> {
  static propTypes = {
    component: PropTypes.object,
    isAuthenticated: PropTypes.bool,
  };

  renderComponent = (props): Node => {
    const { isAuthenticated, component: Component } = this.props;
    if (!isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { from: props.location },
          }}
        />
      );
    }

    return <Component {...props} />;
  };

  render(): Node {
    const { component, ...rest } = this.props;
    return (
      <Route {...rest} render={this.renderComponent} />
    );
  }
}

function mapStateToProps(state) {
  const { apiSession } = state;

  return {
    isAuthenticated: apiSession && apiSession.apikey !== '',
  };
}

export default connect(mapStateToProps, () => ({}))(AuthenticatedRoute);
