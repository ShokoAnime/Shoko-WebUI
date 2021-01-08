import React from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type Props = {
  className?: string;
  children: any;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick: (...args: any) => void;
};

class Button extends React.Component<Props> {
  render() {
    const {
      className,
      children,
      loading,
      disabled,
      tooltip,
      onClick,
    } = this.props;

    return (
      <React.Fragment>
        <button type="button" title={tooltip} className={cx([`${className ?? ''} rounded focus:shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-default`, loading && 'cursor-default'])} onClick={onClick} disabled={disabled}>
          {
            loading
              ? <FontAwesomeIcon icon={faSpinner} spin />
              : children
          }
        </button>
      </React.Fragment>
    );
  }
}

export default Button;
