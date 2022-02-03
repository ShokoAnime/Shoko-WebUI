import React from 'react';
import cx from 'classnames';

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
  center?: boolean
};

function Input(props: Props) {
  const {
    id, label, center, type, placeholder, value, className,
    autoFocus, disabled, onChange, onKeyPress,
  } = props;

  return (
    <React.Fragment>
      <div className={`${className ?? ''} font-mulish`}>
        <label htmlFor={id}>
          {label && <div className="mb-1.5 font-bold">{label}</div>}
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
        </label>
      </div>
    </React.Fragment>
  );
}

export default Input;
