import Checkbox from '@/components/Input/Checkbox';

type Props<T extends string> = {
  idPrefix: string;
  onChange: (selected: T[]) => void;
  options: readonly { label: string, value: T }[];
  selected: readonly T[];
};

/** A multi-select as a row of checkboxes, whose selection keeps the options' order. */
const CheckboxGroup = <T extends string>({ idPrefix, onChange, options, selected }: Props<T>) => (
  <div className="flex flex-wrap gap-x-6 gap-y-1">
    {options.map(option => (
      <Checkbox
        key={option.value}
        id={`${idPrefix}-${option.value}`}
        label={option.label}
        labelRight
        isChecked={selected.includes(option.value)}
        onChange={event =>
          onChange(
            options
              .map(item => item.value)
              .filter(value => (value === option.value ? event.target.checked : selected.includes(value))),
          )}
      />
    ))}
  </div>
);

export default CheckboxGroup;
