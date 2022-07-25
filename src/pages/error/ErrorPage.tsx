import * as Sentry from '@sentry/react';
import React from 'react';
import history from '../../core/history';
import Link from '../../components/Link/Link';

type Props = {
  error?: Error;
  children?: any;
};

type State = {
  hasError: boolean;
  error: {};
  info: {
    componentStack?: {};
  };
};

class ErrorBoundary extends React.Component<Props, State> {
  fallback = ({ error, componentStack }) => (
    <div className="error-page flex h-screen">
      <div className="m-auto">
        <h1 className="code">ERROR</h1>
        <p className="title">You broke the Web UI, congratulations.</p>
        <p className="text">Hopefully useful information:</p>
        <p className="title">{error.toString()}</p>
        <p className="text">Trace:<pre>{componentStack}</pre></p>
        <p className="text">
          <a href="/" onClick={(event) => { event.preventDefault(); history.back(); }}>Go back</a>, or head over to the&nbsp;
          <Link to="/">home page</Link> to choose a new direction.
        </p>
      </div>
    </div>
  );

  render() {
    const { children } = this.props;
    return (
      <Sentry.ErrorBoundary fallback={this.fallback}>{children}</Sentry.ErrorBoundary>
    );
  }
}

export default ErrorBoundary;
