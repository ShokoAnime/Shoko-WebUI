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

class InputSmall extends React.Component<Props> {
  render() {
    const {
      id, type, placeholder, value, className,
      autoFocus, disabled, onChange, onKeyPress,
    } = this.props;

    return (
      <input
        className={`${className} appearance-none bg-color-2 focus:shadow-none focus:outline-none rounded-md text-sm input-field transition duration-300 ease-in-out`}
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
}

export default InputSmall;
