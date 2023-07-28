import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull,
} from '@mdi/js';

import TransitionDiv from '../TransitionDiv';

type Props = {
  id: string;
  label?: string;
  isChecked: boolean;
  intermediate?: boolean;
  className?: string;
  labelRight?: boolean;
  justify?: boolean;
  onChange: (event: any) => void;
};

function Checkbox({ id, label, isChecked, className, onChange, labelRight, justify, intermediate }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <label htmlFor={id} className={cx([justify && 'justify-between', `${className}`, 'cursor-pointer flex items-center transition ease-in-out', focused && 'ring-2 ring-panel-primary ring-inset'])}>
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="border-0 overflow-hidden p-0 absolute whitespace-nowrap w-0 h-0"
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
        }}
        onKeyUp={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {!labelRight && (
        <span className="flex items-center mr-2">
          {label}
        </span>
      )}
      {!intermediate && isChecked && (
        <TransitionDiv className="flex text-panel-primary" enterFrom="opacity-50" appear={false}>
          <Icon path={mdiCheckboxMarkedCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {!intermediate && !isChecked && (
        <TransitionDiv className="flex text-panel-primary" enterFrom="opacity-50" appear={false}>
          <Icon path={mdiCheckboxBlankCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {intermediate && (
        <TransitionDiv className="flex text-panel-primary" enterFrom="opacity-50" appear={false}>
          <Icon path={mdiCircleHalfFull} size={1} />
        </TransitionDiv>
      )}
      {labelRight && (
        <span className="flex items-center font-semibold ml-2">
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
