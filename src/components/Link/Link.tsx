import React from 'react';

import history from '../../core/history';

type Props = {
  to: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

class Link extends React.Component<Props> {
  handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const {
      onClick,
    } = this.props;
    if (onClick) {
      onClick(event);
    }

    if (event.button !== 0
    /* left click */
    ) {
      return;
    }

    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (event.defaultPrevented === true) {
      return;
    }

    event.preventDefault();
    const {
      to,
    } = this.props;
    history.push(to);
  };

  render() {
    const {
      to,
      ...props
    } = this.props;
    return <a href={to} {...props} onClick={this.handleClick} />;
  }
}

export default Link;
