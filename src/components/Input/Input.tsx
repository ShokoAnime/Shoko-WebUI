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
  onKeyUp?: (event: any) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  center?: boolean;
  endIcon?: string;
  endIconClick?: (event: any) => void;
  startIcon?: string;
  inline?: boolean;
};

function Input(props: Props) {
  const {
    id, label, center, type, placeholder, value, className, startIcon,
    autoFocus, disabled, onChange, onKeyUp, endIcon, endIconClick, inline,
  } = props;

  return (
    <React.Fragment>
      <div className={className}>
        <label htmlFor={id} className={cx({ 'flex flex-row justify-center': inline })}>
          {label && <div className={cx('font-semibold text-base', { 'mb-3': !inline, 'flex items-center mr-3 whitespace-nowrap': inline })}>{label}</div>}
          <div className="relative">
            {startIcon && <div className="absolute top-1/2 transform -translate-y-1/2 left-3"><Icon path={startIcon} size={1}/></div>}
            <input
              className={cx(['appearance-none bg-background-alt w-full focus:shadow-none focus:outline-none px-3 py-2 rounded transition ease-in-out border border-background-border focus:ring-2 focus:ring-highlight-1', center && 'text-center', startIcon && 'pl-11'])}
              id={id}
              type={type}
              placeholder={placeholder ?? ''}
              value={value}
              onChange={onChange}
              onKeyUp={onKeyUp}
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
