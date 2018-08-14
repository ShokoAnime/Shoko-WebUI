// @flow
import React from 'react';
import PropTypes from 'prop-types';
import history from '../../core/history';
import Link from '../../components/Link/Link';
import s from './styles.css';

type Props = {
  error?: Error,
  children: any,
}

type State = {
  hasError: boolean,
  error: {},
  info: {
    componentStack?: {}
  }
}

class ErrorBoundary extends React.Component<Props, State> {
  static propTypes = {
    error: PropTypes.object,
    children: PropTypes.node,
  };

  constructor() {
    super();
    this.state = {
      hasError: false,
      error: {},
      info: {},
    };
  }

  componentDidMount() {
    const { hasError } = this.state;
    if (hasError !== true) { return; }
    document.title = 'Error';
  }

  goBack = (event: Event) => {
    event.preventDefault();
    history.goBack();
  };

  componentDidCatch(error: {}, info: {componentStack?: {}}) {
    // Display fallback UI
    this.setState({ hasError: true, error, info });
  }

  render() {
    const { hasError } = this.state;
    const { children, error } = this.props;
    if (hasError === false) {
      return children;
    }
    if (error) console.error(error); // eslint-disable-line no-console
    const { error: pageError, info } = this.state;

    return (
      <div className={s.container}>
        <main className={s.content}>
          <h1 className={s.code}>ERROR</h1>
          <p className={s.title}>You broke the Web UI, congratulations.</p>
          <p className={s.text}>Hopefully useful information:</p>
          <p className={s.title}>{pageError.toString()}</p>
          {info && info.componentStack
            ? <p className={s.text}>Trace:<pre>{info.componentStack.toString()}</pre></p> : null}
          <p className={s.text}>
            <a href="/" onClick={this.goBack}>Go back</a>, or head over to the&nbsp;
            <Link to="/">home page</Link> to choose a new direction.
          </p>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
