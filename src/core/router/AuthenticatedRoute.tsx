import React from 'react';
import type { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';

type OwnProps = {
  exact?: boolean;
  path: string;
  component: React.ComponentType<any>;
};

type StateProps = {
  isAuthenticated?: boolean;
};

type Props = OwnProps & StateProps;

class AuthenticatedRoute extends React.Component<Props> {
  static propTypes = {
    exact: PropTypes.bool,
    path: PropTypes.string.isRequired,
    component: PropTypes.any.isRequired,
    isAuthenticated: PropTypes.bool,
  };

  renderComponent = (props): ReactNode => {
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

  render(): ReactNode {
    const { component, ...rest } = this.props;
    return (
      <Route {...rest} render={this.renderComponent} />
    );
  }
}

function mapStateToProps(state): StateProps {
  const { apiSession } = state;

  return {
    isAuthenticated: apiSession && apiSession.apikey !== '',
  };
}

export default connect(mapStateToProps, () => ({}))(AuthenticatedRoute);
