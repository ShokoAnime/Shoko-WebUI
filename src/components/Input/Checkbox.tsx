import React from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

type Props = {
  id: string;
  label?: string;
  isChecked: any;
  className?: string;
  onChange: (event: any) => void;
};

class Checkbox extends React.Component<Props> {
  render() {
    const {
      id, label, isChecked, className, onChange,
    } = this.props;

    return (
      <React.Fragment>
        <div className={cx([`${className ?? ''} w-auto`, label && 'py-2'])}>
          <label className="block font-muli" htmlFor={id} style={{ cursor: 'pointer' }}>
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
