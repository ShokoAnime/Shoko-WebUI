import React from 'react';
import type { PlacesType } from 'react-tooltip';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

type Props = {
  buttonType?: string;
  buttonSize?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  submit?: boolean;
  tooltip?: string;
  tooltipPlace?: PlacesType;
};

const Button = React.memo(
  (
    {
      buttonSize = '',
      buttonType = '',
      children,
      className,
      disabled,
      loading,
      loadingSize,
      onClick,
      submit,
      tooltip,
      tooltipPlace,
    }: Props,
  ) => (
    <button
      type={submit ? 'submit' : 'button'}
      className={cx([
        className,
        'relative text-sm font-semibold transition ease-in-out rounded-lg outline-hidden',
        buttonType && `${buttonTypeClasses[buttonType]}`,
        buttonSize && `${buttonSizeClasses[buttonSize]}`,
        (loading || disabled) && 'opacity-65 cursor-default',
      ])}
      onClick={onClick}
      disabled={loading || disabled}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-place={tooltipPlace ?? 'top'}
    >
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
        </div>
      )}
    </button>
  ),
);

export default Button;
