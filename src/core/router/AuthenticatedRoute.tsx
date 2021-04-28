import PropTypes from 'prop-types';
import React from 'react';
import type { ReactNode } from 'react';
import { Route, Redirect } from 'react-router';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../store';

class AuthenticatedRoute extends React.Component<Props> {
  static propTypes = {
    exact: PropTypes.bool,
    path: PropTypes.string.isRequired,
    component: PropTypes.any.isRequired,
  };

  renderComponent = (props): ReactNode => {
    const { isAuthenticated, component: Component } = this.props;
    if (!isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      );
    }

    return <Component {...props} />;
  };

  render(): ReactNode {
    const { component, ...rest } = this.props;
    return (
      <Route {...rest} render={this.renderComponent} />
    );
  }
}

const mapState = (state: RootState) => ({
  isAuthenticated: state.apiSession && state.apiSession.apikey !== '',
});

const connector = connect(mapState);

type Props = ConnectedProps<typeof connector> & {
  exact?: boolean;
  path: string;
  component: React.ComponentType<any>;
};

export default connector(AuthenticatedRoute);
