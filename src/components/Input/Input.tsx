import React from 'react';
import cx from 'classnames';
import { Icon } from '@mdi/react';

type Props = {
  id: string;
  label?: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: (event: any) => void;
  onKeyPress?: (event: any) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  center?: boolean;
  endIcon?: string;
  endIconClick?: (event: any) => void;
};

function Input(props: Props) {
  const {
    id, label, center, type, placeholder, value, className,
    autoFocus, disabled, onChange, onKeyPress, endIcon, endIconClick,
  } = props;

  return (
    <React.Fragment>
      <div className={`${className ?? ''} font-open-sans`}>
        <label htmlFor={id}>
          {label && <div className="mb-1.5 font-semibold text-base">{label}</div>}
          <div className="relative">
          <input
            className={cx(['appearance-none bg-background-alt w-full focus:shadow-none focus:outline-none px-2 py-1.5 rounded transition duration-300 ease-in-out border border-background-border focus:border-highlight-1', center && 'text-center'])}
            id={id}
            type={type}
            placeholder={placeholder ?? ''}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            disabled={disabled}
          />
            {endIcon && <div onClick={endIconClick} className="cursor-pointer absolute top-1/2 transform -translate-y-1/2 right-3 text-highlight-1"><Icon path={endIcon} size={1} horizontal vertical rotate={180}/></div>}
          </div>
        </label>
      </div>
    </React.Fragment>
  );
}

export default Input;
