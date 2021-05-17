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

class Input extends React.Component<Props> {
  render() {
    const {
      id, label, center, type, placeholder, value, className,
      autoFocus, disabled, onChange, onKeyPress,
    } = this.props;

    return (
      <React.Fragment>
        <div className={`${className ?? ''}`}>
          <label className="text-lg font-bold" htmlFor={id}>
            {label && <div className="mb-4">{label}</div>}
            <input
              className={cx(['appearance-none bg-color-1 w-full focus:shadow-none focus:outline-none p-4 rounded-lg input-field transition duration-300 ease-in-out', center && 'text-center'])}
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
}

export default Input;
