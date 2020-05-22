import PropTypes from 'prop-types';
import React from 'react';

type Props = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (event: any) => void;
  onKeyPress?: (event: any) => void;
};

class Input extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func,
  };

  render() {
    const {
      id, label, type, placeholder, value, onChange, onKeyPress,
    } = this.props;

    return (
      <React.Fragment>
        <div className="py-2 input-item">
          <label className="block font-bold mb-2" htmlFor={id}>
            {label}
            <input
              className="appearance-none border-b-2 w-full py-2 leading-tight focus:shadow-none focus:outline-none"
              id={id}
              type={type}
              placeholder={placeholder || ''}
              value={value}
              onChange={onChange}
              onKeyPress={onKeyPress}
            />
          </label>
        </div>
      </React.Fragment>
    );
  }
}

export default Input;
