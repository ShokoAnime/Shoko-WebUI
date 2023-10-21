import React from 'react';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
};

function InputSmall(props: Props) {
  const {
    autoComplete,
    autoFocus,
    className,
    disabled,
    id,
    onChange,
    onKeyUp,
    placeholder,
    type,
    value,
  } = props;

  return (
    <input
      className={`${className} appearance-none rounded-md border border-panel-border bg-panel-input text-sm transition ease-in-out focus:shadow-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-panel-icon-action`}
      id={id}
      type={type}
      placeholder={placeholder ?? ''}
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      autoFocus={autoFocus}
      disabled={disabled}
      autoComplete={autoComplete ?? 'on'}
    />
  );
}

export default InputSmall;
