import React, { useState } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

import TransitionDiv from '../TransitionDiv';

type Props = {
  id: string;
  label?: string;
  isChecked: boolean;
  className?: string;
  labelRight?: boolean;
  onChange: (event: any) => void;
};

function Checkbox(props: Props) {
  const [focused, setFocused] = useState(false);
  const {
    id, label, isChecked, className, onChange,
    labelRight,
  } = props;

  return (
    <label htmlFor={id} className={cx([`${className ?? ''} cursor-pointer checkbox flex items-center justify-between font-mulish`, focused ? 'checkbox-focused' : 'checkbox'])}>
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
        <span className="flex items-center ">
          {label}
        </span>
      )}
      {isChecked && (
        <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
          <FontAwesomeIcon icon={faCheckCircle} />
        </TransitionDiv>
      )}
      {!isChecked && (
        <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
          <FontAwesomeIcon icon={faCircle} />
        </TransitionDiv>
      )}
      {labelRight && (
        <span className="flex items-center ml-2">
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
