import React from 'react';
import * as Sentry from '@sentry/react';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
  children?: any;
};

const Fallback = ({ error, componentStack }) => {
  const navigate = useNavigate();

  return (
    <div className="error-page flex h-screen">
      <div className="m-auto">
        <h1 className="code">ERROR</h1>
        <p className="title">You broke the Web UI, congratulations.</p>
        <p className="text">Hopefully useful information:</p>
        <p className="title">{error.toString()}</p>
        <p className="text">Trace:<pre>{componentStack}</pre></p>
        <p className="text">
          <span className="text-highlight-1 cursor-pointer" onClick={() => navigate(-1)}>Go back</span>, or head over to the&nbsp;
          <Link to="/">home page</Link> to choose a new direction.
        </p>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }: Props) => (
  <Sentry.ErrorBoundary fallback={Fallback} showDialog>
    {children}
  </Sentry.ErrorBoundary>
);

export default ErrorBoundary;
