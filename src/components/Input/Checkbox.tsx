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
  labelRight?: boolean;
  onChange: (event: any) => void;
};

class Checkbox extends React.Component<Props> {
  render() {
    const {
      id, label, isChecked, className, onChange,
      labelRight,
    } = this.props;

    return (
      <React.Fragment>
        <div className={cx([`${className ?? ''} w-auto`, label && 'my-1'])}>
          <label className="flex justify-between block font-mulish" htmlFor={id} style={{ cursor: 'pointer' }}>
            {!labelRight && (
              <span>
                {label}
              </span>
            )}
            <input className="hidden" type="checkbox" id={id} checked={isChecked} onChange={onChange} />
            <span className="color-accent">
              <FontAwesomeIcon icon={isChecked ? faCheckCircle : faCircle} className="align-middle" />
            </span>
            {labelRight && (
              <span className="ml-2">
                {label}
              </span>
            )}
          </label>
        </div>
      </React.Fragment>
    );
  }
}

export default Checkbox;
