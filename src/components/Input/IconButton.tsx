import React from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';

import type { ButtonType, SizeType } from '@/components/Input/Button.utils';

type IconButtonProps = {
  icon: string;

  className?: string;
  onClick: React.MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
  buttonType: ButtonType;
  buttonSize: SizeType;
};

const IconButton = ({ buttonSize = 'normal', buttonType = 'secondary', className, icon, onClick }: IconButtonProps) => (
  <Button
    className={cx(
      'cursor-pointer rounded-lg',
      className,
      buttonTypeClasses[buttonType],
      buttonSizeClasses[buttonSize],
    )}
    onClick={onClick}
  >
    <Icon path={icon} size={1} />
  </Button>
);

export default IconButton;
