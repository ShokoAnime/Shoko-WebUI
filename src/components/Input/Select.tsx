import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

type Props = {
  id: string;
  value: string | number;
  onChange: (event: any) => void;
  className?: string;
  children: any,
};

class Select extends React.Component<Props> {
  render() {
    const {
      id, value, className, children, onChange,
    } = this.props;

    return (
      <React.Fragment>
        <div className={`${className ?? ''} w-auto relative`}>
          <select id={id} value={value} onChange={onChange} className="w-full appearance-none border text-sm font-exo2 rounded pl-2 pr-5 focus:shadow-none focus:outline-none select-field">
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 px-2">
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Select;
