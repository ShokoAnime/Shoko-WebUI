import React from 'react';
import cx from 'classnames';

import Button from './Button';

type Props = {
  states: { label?: string, value: string }[];
  className?: string;
  alternateColor?: boolean;
  activeState: string;
  onStateChange: (state: string) => void;
};

const MultiStateButton = ({ activeState, alternateColor, className, onStateChange, states }: Props) => (
  <div className={typeof className === 'string' ? className : 'flex gap-x-2'}>
    {states.map(option => (
      <Button
        className={cx(
          'w-[9.6rem] rounded-lg py-3 px-4 !font-medium !text-sm',
          activeState === option.value && '!bg-panel-toggle-background text-panel-toggle-text',
          activeState !== option.value && 'text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
          activeState !== option.value && !alternateColor ? 'bg-panel-background' : 'bg-panel-toggle-background-alt',
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
