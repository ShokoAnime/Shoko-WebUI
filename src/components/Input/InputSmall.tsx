import React from 'react';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: (event: any) => void;
  onKeyUp?: (event: any) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
};

function InputSmall(props: Props) {
  const {
    id, type, placeholder, value, className,
    autoFocus, disabled, onChange, onKeyUp,
    autoComplete,
  } = props;

  return (
    <input
      className={`${className} appearance-none bg-default-background-input focus:shadow-none focus:outline-none rounded-md text-sm input-field transition ease-in-out border border-default-border focus:ring-2 focus:ring-default-primary focus:ring-inset`}
      id={id}
      type={type}
      placeholder={placeholder ?? ''}
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      disabled={disabled}
      autoComplete={autoComplete ?? 'on'}
    />
  );
}

export default InputSmall;
