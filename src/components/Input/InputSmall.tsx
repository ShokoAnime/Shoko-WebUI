import type { ChangeEvent, ChangeEventHandler, KeyboardEventHandler, ReactNode } from 'react';

import toast from '@/core/toast';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  suffixes?: ReactNode;
  min?: number;
  max?: number;
};

const InputSmall = (props: Props) => {
  const {
    autoComplete,
    autoFocus,
    className,
    disabled,
    id,
    max,
    min,
    onChange,
    onKeyUp,
    placeholder,
    suffixes,
    type,
    value,
  } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && max && event.target.valueAsNumber > max) {
      toast.info(`Value cannot be greater than ${max}!`);

      const newEvent = { ...event };
      newEvent.target.value = max.toString();
      newEvent.target.valueAsNumber = max;

      onChange(newEvent);
      return;
    }

    onChange(event);
  };

  return (
    <>
      <input
        className={`${className} h-8 appearance-none rounded-lg border border-panel-border bg-panel-input text-sm transition ease-in-out focus:shadow-none focus:ring-2 focus:ring-panel-icon-action focus:outline-hidden focus:ring-inset`}
        id={id}
        type={type}
        placeholder={placeholder ?? ''}
        value={value}
        onChange={handleChange}
        onKeyUp={onKeyUp}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete={autoComplete ?? 'on'}
        min={min}
        max={max}
      />

      {suffixes}
    </>
  );
};

export default InputSmall;
