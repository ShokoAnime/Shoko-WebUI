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

  const defineOwn = (target: object, name: string, ownValue: unknown) => {
    Object.defineProperty(target, name, { value: ownValue, writable: true, enumerable: true, configurable: true });
  };

  const withValue = (event: ChangeEvent<HTMLInputElement>, nextValue: string) => {
    // Prototype-preserving clone of the DOM target; own properties are defined (not
    // assigned) so the accessors on the prototype chain (React's value tracker,
    // native valueAsNumber) are shadowed instead of invoked ("Illegal invocation").
    const target = Object.create(event.target) as HTMLInputElement;
    defineOwn(target, 'value', nextValue);
    defineOwn(target, 'valueAsNumber', nextValue === '' ? Number.NaN : Number(nextValue));

    return { ...event, target } as ChangeEvent<HTMLInputElement>;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type !== 'number') {
      onChange(event);
      return;
    }

    const { valueAsNumber } = event.target;
    if (Number.isFinite(valueAsNumber)) {
      if (max !== undefined && valueAsNumber > max) {
        toast.info(`Value cannot be greater than ${max}!`);
        onChange(withValue(event, max.toString()));
        return;
      }

      if (min !== undefined && valueAsNumber < min) {
        toast.info(`Value cannot be less than ${min}!`);
        onChange(withValue(event, min.toString()));
        return;
      }
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
