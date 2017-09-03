import React, { PropTypes } from 'react';
import history from '../../core/history';

class Link extends React.Component {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    onClick: PropTypes.func,
  };

  handleClick = (event) => {
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

    if (this.props.to) {
      history.push(this.props.to);
    } else {
      history.push({
        pathname: event.currentTarget.pathname,
        search: event.currentTarget.search,
      });
    }
  };

  render() {
    const { to, ...props } = this.props; // eslint-disable-line no-use-before-define
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={to} {...props} onClick={this.handleClick} />;
  }
}

export default Link;
