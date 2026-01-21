import React from 'react';

import toast from '@/components/Toast';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  suffixes?: React.ReactNode;
  min?: number;
  max?: number;
};

const InputSmall = React.memo((props: Props) => {
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        className={`${className} h-8 appearance-none rounded-lg border border-panel-border bg-panel-input text-sm transition ease-in-out focus:shadow-none focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-panel-icon-action`}
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
});

export default InputSmall;
