import React from 'react';

import toast from '@/components/Toast';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  id: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onMouseUp?: React.MouseEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  suffixes?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
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
    onClick,
    onKeyUp,
    onMouseUp,
    placeholder,
    step,
    suffixes,
    type,
    value,
  } = props;

  const handleChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && max && event.target.valueAsNumber > max) {
      toast.info(`Value cannot be greater than ${max}!`);
      onChange({
        ...event,
        target: {
          ...event.target,
          value: max.toString(),
          valueAsNumber: max,
        },
      });
      return;
    }
    if (type === 'number' && min && event.target.valueAsNumber < min) {
      toast.info(`Value cannot be less than ${min}!`);
      onChange({
        ...event,
        target: {
          ...event.target,
          value: min.toString(),
          valueAsNumber: min,
        },
      });
      return;
    }

    onChange(event);
  });

  return (
    <>
      <input
        className={`${className} h-8 appearance-none rounded-lg border border-panel-border bg-panel-input text-sm transition ease-in-out focus:shadow-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-panel-icon-action`}
        id={id}
        type={type}
        placeholder={placeholder ?? ''}
        value={value}
        onChange={handleChange}
        onClick={onClick}
        onMouseUp={onMouseUp}
        onKeyUp={onKeyUp}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete={autoComplete ?? 'on'}
        min={min}
        max={max}
        step={step}
      />

      {suffixes}
    </>
  );
});

export default InputSmall;
