import React from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';

type Props = {
  className?: string;
  children: any;
  loading?: boolean;
  loadingSize?: number;
  disabled?: boolean;
  tooltip?: string;
  onClick?: (...args: any) => void;
  submit?: boolean;
  dropShadow?: boolean;
};

function Button(props: Props) {
  const {
    className, children, dropShadow,
    loading, disabled, tooltip,
    onClick, submit, loadingSize,
  } = props;

  return (
    <button type={submit ? 'submit' : 'button'} title={tooltip} className={cx([`${className ?? ''} text-font-alt text-sm rounded ${dropShadow ? 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]' : ''} focus:shadow-none focus:outline-none button transition ease-in-out`, loading && 'cursor-default', disabled && 'opacity-50 cursor-default'])} onClick={onClick} disabled={disabled}>
      {
        loading
          ? (
            <div className="flex justify-center">
              <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
            </div>
          )
          : children
      }
    </button>
  );
}

export default Button;
