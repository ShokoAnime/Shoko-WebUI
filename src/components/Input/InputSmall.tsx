import React from 'react';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: (event: any) => void;
  onKeyPress?: (event: any) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
};

function InputSmall(props: Props) {
  const {
    id, type, placeholder, value, className,
    autoFocus, disabled, onChange, onKeyPress,
  } = props;

  return (
    <input
      className={`${className} appearance-none bg-background-alt focus:shadow-none focus:outline-none rounded-md text-sm input-field transition ease-in-out border border-background-border focus:border-highlight-1`}
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
  );
}

export default InputSmall;
