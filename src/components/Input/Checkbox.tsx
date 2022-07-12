import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import {
  mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline,
  mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline,
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
  isSquare?: boolean;
};

function Checkbox({ id, label, isChecked, className, onChange, labelRight, justify, isSquare = false }: Props) {
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
        <span className="flex items-center font-open-sans">
          {label}
        </span>
      )}
      {isChecked && (
        <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
          <Icon path={isSquare ? mdiCheckboxMarkedOutline : mdiCheckboxMarkedCircleOutline} size={0.75} />
        </TransitionDiv>
      )}
      {!isChecked && (
        <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
          <Icon path={isSquare ? mdiCheckboxBlankOutline : mdiCheckboxBlankCircleOutline} size={0.75} />
        </TransitionDiv>
      )}
      {labelRight && (
        <span className="flex items-center font-semibold font-open-sans ml-2">
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
