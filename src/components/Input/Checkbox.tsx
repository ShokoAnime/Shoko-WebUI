import React, { memo, useState } from 'react';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import TransitionDiv from '@/components/TransitionDiv';

type Props = {
  id: string;
  label?: string;
  isChecked: boolean;
  disabled?: boolean;
  intermediate?: boolean;
  className?: string;
  labelRight?: boolean;
  justify?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Checkbox = memo((props: Props) => {
  const { className, disabled = false, id, intermediate, isChecked, justify, label, labelRight, onChange } = props;
  const [focused, setFocused] = useState(false);

  return (
    <label
      htmlFor={id}
      className={cx([
        justify && 'justify-between',
        `${className}`,
        'flex items-center transition ease-in-out',
        focused && 'ring-2 ring-panel-icon-action ring-inset',
        disabled ? 'opacity-65 cursor-auto' : 'cursor-pointer',
      ])}
    >
      <input
        id={id}
        type="checkbox"
        checked={!disabled && isChecked}
        onChange={disabled ? undefined : onChange}
        className="absolute h-0 w-0 overflow-hidden whitespace-nowrap border-0 p-0"
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
        }}
        onKeyUp={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!labelRight && (
        <span className="mr-2 flex items-center">
          {label}
        </span>
      )}
      {!intermediate && isChecked && (
        <TransitionDiv className="flex text-panel-icon-action" enterFrom="opacity-65" appear={false}>
          <Icon className="text-panel-icon-action" path={mdiCheckboxMarkedCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {!intermediate && !isChecked && (
        <TransitionDiv className="flex text-panel-icon-action" enterFrom="opacity-65" appear={false}>
          <Icon className="text-panel-icon-action" path={mdiCheckboxBlankCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {intermediate && (
        <TransitionDiv className="flex text-panel-icon-action" enterFrom="opacity-65" appear={false}>
          <Icon className="text-panel-icon-action" path={mdiCircleHalfFull} size={1} />
        </TransitionDiv>
      )}
      {labelRight && (
        <span className="ml-2 flex items-center font-semibold">
          {label}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
