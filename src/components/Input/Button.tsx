import React from 'react';
import type { PlacesType } from 'react-tooltip';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

import type { ButtonType, SizeType } from '@/components/Input/Button.utils';

type Props = {
  id?: string;
  buttonType?: ButtonType;
  buttonSize?: SizeType;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  submit?: boolean;
  tooltip?: string;
  tooltipPlace?: PlacesType;
  keybinding?: string;
};

const Button = ({
  buttonSize,
  buttonType,
  children,
  className,
  disabled,
  id,
  keybinding,
  loading,
  loadingSize,
  onClick,
  submit,
  tooltip,
  tooltipPlace,
}: Props) => (
  <button
    id={id}
    type={submit ? 'submit' : 'button'}
    className={cx([
      className,
      keybinding && 'flex items-center gap-x-2',
      'relative rounded-lg text-sm font-semibold transition ease-in-out',
      buttonType && buttonTypeClasses[buttonType],
      buttonSize && buttonSizeClasses[buttonSize],
      (loading || disabled) && 'cursor-default opacity-65',
    ])}
    onClick={onClick}
    disabled={loading || disabled}
    data-tooltip-id="tooltip"
    data-tooltip-content={tooltip}
    data-tooltip-place={tooltipPlace ?? 'top'}
  >
    {keybinding
      ? (
        <>
          {children}
          <span className="-ml-1 self-center text-xs opacity-65">
            (
            {keybinding}
            )
          </span>
        </>
      )
      : children}
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon path={mdiLoading} spin size={loadingSize ?? 1} />
      </div>
    )}
  </button>
);

export default Button;
