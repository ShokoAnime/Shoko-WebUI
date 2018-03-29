// @flow
import PropTypes from 'prop-types';
import React from 'react';
import history from '../../core/history';

type Props = {
  to: string,
  onClick?: (SyntheticMouseEvent<HTMLButtonElement>) => void
}

class Link extends React.Component<Props> {
  static propTypes = {
    to: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  };

  handleClick = (event: SyntheticMouseEvent<HTMLButtonElement>) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (event.button !== 0 /* left click */) {
      return;
    }

    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (event.defaultPrevented === true) {
      return;
    }

    event.preventDefault();

    history.push(this.props.to);
  };

  render() {
    const { to, ...props } = this.props; // eslint-disable-line no-use-before-define
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={to} {...props} onClick={this.handleClick} />;
  }
}

export default Link;
