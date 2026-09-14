import type { MouseEventHandler } from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

import type { ButtonType, SizeType } from '@/components/Input/Button.utils';

type IconButtonProps = {
  icon: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  buttonType: ButtonType;
  buttonSize: SizeType;
  tooltip?: string;
};

const IconButton = (
  { buttonSize, buttonType, className, disabled, icon, loading, onClick, tooltip }: IconButtonProps,
) => (
  <Button
    className={cx(
      'rounded-lg',
      className,
      buttonTypeClasses[buttonType],
      buttonSizeClasses[buttonSize],
    )}
    onClick={onClick}
    tooltip={tooltip}
    disabled={disabled}
    loading={loading}
  >
    <Icon path={icon} size={1} />
  </Button>
);

export default IconButton;
