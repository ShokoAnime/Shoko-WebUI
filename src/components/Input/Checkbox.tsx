import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

type Props = {
  id: string;
  label: string;
  isChecked: any;
  onChange: (event: any) => void;
};

class Checkbox extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    isChecked: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const {
      id, label, isChecked, onChange,
    } = this.props;

    return (
      <React.Fragment>
        <div className="py-2 w-1/3 input-item">
          <label className="block" htmlFor={id} style={{ cursor: 'pointer' }}>
            <input className="w-0 h-0" type="checkbox" id={id} checked={isChecked} onChange={onChange} />
            <span className="mr-2 color-accent">
              {
                isChecked
                  ? (<FontAwesomeIcon icon={faCheckCircle} />)
                  : (<FontAwesomeIcon icon={faCircle} />)
              }
            </span>
            <span>
              {label}
            </span>
          </label>
        </div>
      </React.Fragment>
    );
  }
}

export default Checkbox;
