import React from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';

type Props = {
  buttonType?: string;
  className?: string;
  children: any;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  onClick?: (...args: any) => void;
  submit?: boolean;
  tooltip?: string;
};

function Button(props: Props) {
  const {
    className, children, buttonType,
    loading, disabled, tooltip,
    onClick, submit, loadingSize,
  } = props;

  const buttonTypeClasses:object = {
    primary: 'bg-button-primary hover:bg-button-primary-hover text-button-text-alt drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border',
    secondary: 'bg-button-secondary hover:bg-button-secondary-hover text-button-text drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border',
    danger: 'bg-button-danger hover:bg-button-danger-hover text-button-text-alt drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-panel-border',
  };

  return (
    <button type={submit ? 'submit' : 'button'} title={tooltip} className={cx([`${className ?? ''} button font-semibold transition ease-in-out text-sm rounded focus:shadow-none focus:outline-none`, buttonType !== undefined && (buttonTypeClasses[buttonType]), loading && 'cursor-default', disabled && 'opacity-50 cursor-default'])} onClick={onClick} disabled={disabled}>
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
