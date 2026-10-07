import cx from 'classnames';

import Button from '@/components/Input/Button';

type Props<T extends string> = {
  options: readonly { label: string, value: T }[];
  selected: readonly T[];
  onChange: (selected: T[]) => void;
  className?: string;
};

/**
 * A multi-select as a row of chips, each switched on and off by a click. The selection keeps the options' order.
 */
const ToggleChips = <T extends string>({ className, onChange, options, selected }: Props<T>) => {
  const toggle = (value: T) =>
    onChange(
      options
        .map(option => option.value)
        .filter(item => (item === value ? !selected.includes(item) : selected.includes(item))),
    );

  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {options.map(option => (
        <Button
          key={option.value}
          className={cx(
            'rounded-lg px-3 py-1 text-sm font-medium',
            selected.includes(option.value)
              ? 'bg-panel-toggle-background! text-panel-toggle-text'
              : 'bg-panel-toggle-background-alt text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover',
          )}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ToggleChips;
