import cx from 'classnames';

import Button from './Button';

type Props = {
  states: readonly { label?: string, value: string }[];
  className?: string;
  alternateColor?: boolean;
  /** Narrower, lower buttons sized to their labels, for a toolbar. */
  compact?: boolean;
  activeState: string;
  onStateChange: (state: string) => void;
};

const MultiStateButton = ({ activeState, alternateColor, className, compact, onStateChange, states }: Props) => (
  <div className={className ?? 'flex gap-x-2'}>
    {states.map(option => (
      <Button
        className={cx(
          'rounded-lg text-sm font-medium',
          compact ? 'px-3 py-1' : 'w-40 px-4 py-3',
          activeState === option.value && 'bg-panel-toggle-background! text-panel-toggle-text',
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
