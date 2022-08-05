import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiCheckboxBlankOutline, mdiCheckboxMarked,
} from '@mdi/js';

import TransitionDiv from '../TransitionDiv';

type Props = {
  id: string;
  label?: string;
  isChecked: boolean;
  className?: string;
  labelRight?: boolean;
  justify?: boolean;
  onChange: (event: any) => void;
};

function Checkbox({ id, label, isChecked, className, onChange, labelRight, justify }: Props) {
  const [focused, setFocused] = useState(false);


  return (
    <label htmlFor={id} className={cx({ 'justify-between': justify === true }, [`${className ?? ''} cursor-pointer flex items-center border transition duration-300 ease-in-out`, focused ? 'border-highlight-1' : 'border-transparent'])}>
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
        <span className="flex items-center">
          {label}
        </span>
      )}
      {isChecked && (
        <TransitionDiv className="flex text-highlight-1" enterFrom="opacity-50">
          <Icon path={mdiCheckboxMarked} size={1} />
        </TransitionDiv>
      )}
      {!isChecked && (
        <TransitionDiv className="flex text-highlight-1" enterFrom="opacity-50">
          <Icon path={mdiCheckboxBlankOutline} size={1} />
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
