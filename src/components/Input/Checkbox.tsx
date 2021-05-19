import React from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

import TransitionDiv from '../TransitionDiv';

type Props = {
  id: string;
  label?: string;
  isChecked: boolean;
  className?: string;
  labelRight?: boolean;
  onChange: (event: any) => void;
};

type State = {
  focused: boolean;
};

class Checkbox extends React.Component<Props, State> {
  state = {
    focused: false,
  };

  render() {
    const {
      id, label, isChecked, className, onChange,
      labelRight,
    } = this.props;

    const { focused } = this.state;

    return (
      <label htmlFor={id} className={cx([`${className ?? ''} cursor-pointer checkbox flex items-center justify-between font-mulish`, focused ? 'checkbox-focused' : 'checkbox'])}>
        <input
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="border-0 overflow-hidden p-0 absolute whitespace-nowrap w-0 h-0"
          style={{
            clip: 'rect(0 0 0 0)',
            clipPath: 'inset(50%)',
          }}
          onKeyUp={() => this.setState({ focused: true })}
          onBlur={() => this.setState({ focused: false })}
        />
        {!labelRight && (
          <span className="flex items-center ">
            {label}
          </span>
        )}
        {isChecked && (
          <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
            <FontAwesomeIcon icon={faCheckCircle} />
          </TransitionDiv>
        )}
        {!isChecked && (
          <TransitionDiv className="flex color-highlight-1" enterFrom="opacity-50">
            <FontAwesomeIcon icon={faCircle} />
          </TransitionDiv>
        )}
        {labelRight && (
          <span className="flex items-center ml-2">
            {label}
          </span>
        )}
      </label>
    );
  }
}

export default Checkbox;
