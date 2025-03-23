import React, { memo, useState } from 'react';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  id: string;
  label?: React.ReactNode;
  labelClassName?: string;
  isChecked: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  labelRight?: boolean;
  justify?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Checkbox = memo((props: Props) => {
  const {
    className,
    disabled = false,
    id,
    isChecked,
    justify,
    label,
    labelClassName,
    labelRight,
    onChange,
    readOnly = false,
  } = props;
  const [focused, setFocused] = useState(false);

  return (
    <label
      htmlFor={id}
      className={cx([
        justify && 'justify-between',
        `${className}`,
        'flex items-center transition ease-in-out gap-x-2',
        focused && 'ring-2 ring-panel-icon-action ring-inset',
        disabled && 'opacity-65',
        disabled || readOnly ? 'cursor-auto' : 'cursor-pointer',
        'h-8',
      ])}
    >
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        readOnly={readOnly}
        onChange={disabled || readOnly ? undefined : onChange}
        className="absolute size-0 overflow-hidden whitespace-nowrap border-0 p-0"
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
        }}
        onKeyUp={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!labelRight && (
        <span className={`${labelClassName} flex items-center`}>
          {label}
        </span>
      )}
      <div className="flex text-panel-icon-action">
        <Icon
          className="text-panel-icon-action"
          path={isChecked ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline}
          size={1}
        />
      </div>
      {labelRight && (
        <span className={`${labelClassName} flex items-center`}>
          {label}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
