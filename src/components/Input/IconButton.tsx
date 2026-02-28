import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

import type { ButtonType, SizeType } from '@/components/Input/Button.utils';

type IconButtonProps = {
  icon: string;
  className?: string;
  disabled?: boolean;
  onClick: React.MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
  buttonType: ButtonType;
  buttonSize: SizeType;
  tooltip?: string;
};

const IconButton = (
  { buttonSize = 'normal', buttonType = 'secondary', className, disabled, icon, onClick, tooltip }: IconButtonProps,
) => (
  <Button
    className={cx(
      'rounded-lg',
      className,
      buttonTypeClasses[buttonType],
      buttonSizeClasses[buttonSize],
      !disabled && 'cursor-pointer',
    )}
    onClick={onClick}
    tooltip={tooltip}
    disabled={disabled}
  >
    <Icon path={icon} size={1} />
  </Button>
);

export default IconButton;
