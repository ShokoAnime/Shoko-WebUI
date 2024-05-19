import React from 'react';
import cx from 'classnames';

import Button from './Button';

type Props = {
  states: { label?: string, value: string }[];
  className?: string;
  activeState: string;
  onStateChange: (state: string) => void;
};

const MultiStateButton = ({ activeState, className, onStateChange, states }: Props) => (
  <div className={typeof className === 'string' ? className : 'flex gap-x-2'}>
    {states.map(option => (
      <Button
        className={cx(
          'w-[9.6rem] rounded-lg py-3 px-4 !font-normal !text-base',
          activeState === option.value
            ? '!bg-panel-toggle-background text-panel-toggle-text'
            : 'bg-panel-background text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
        )}
        key={option.value}
        onClick={() => onStateChange(option.value)}
      >
        {option.label ?? option.value}
      </Button>
    ))}
  </div>
);

export default MultiStateButton;
