import React from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

type Props = {
  className?: string;
  children: any;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick: (...args: any) => void;
};

function Button(props: Props) {
  const {
    className, children, loading,
    disabled, tooltip, onClick,
  } = props;

  return (
    <button type="button" title={tooltip} className={cx([`${className ?? ''} text-white text-sm font-semibold rounded-md focus:shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-default button transition duration-300 ease-in-out`, loading && 'cursor-default'])} onClick={onClick} disabled={disabled}>
      {
        loading
          ? <FontAwesomeIcon icon={faCircleNotch} spin />
          : children
      }
    </button>
  );
}

export default Button;
