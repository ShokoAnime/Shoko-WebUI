import React from 'react';

import history from '../../core/history';

type Props = {
  to: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: any;
};

function Link(props: Props) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.onClick) {
      props.onClick(event);
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
    history.push(props.to);
  };

  const { to, ...otherProps } = props;

  return <a href={to} {...otherProps} onClick={handleClick} />;
}

export default Link;
