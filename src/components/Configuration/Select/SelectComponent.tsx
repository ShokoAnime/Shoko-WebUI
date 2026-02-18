import React, { useCallback, useMemo, useRef } from 'react';
import { mdiChevronDown, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import useEventCallback from '@/hooks/useEventCallback';

const BorderPadding = 1;

export type SelectComponentProps<TValue> = {
  id: string;
  values: (OptionGroupType | OptionType<TValue>)[];
  disabled?: boolean;
  onChange: (
    nextOption: OptionType<TValue> | null,
    previousOption: OptionType<TValue> | null,
    event: React.ChangeEvent<HTMLSelectElement> | React.MouseEvent<HTMLSelectElement>,
  ) => void;
  className?: string;
  serverControlled?: boolean;
  label?: string;
  loading?: boolean;
};

export type OptionGroupType = {
  id: number;
  label: string;
  disabled?: boolean;
};

export type OptionType<TValue> = {
  label?: string | null;
  groupId?: number | null;
  value: TValue;
  selected?: boolean;
  default?: boolean;
  disabled?: boolean;
};

function isOption<TValue>(target: OptionGroupType | OptionType<TValue>): target is OptionType<TValue> {
  return (target as OptionGroupType).id === undefined && (target as OptionType<TValue>).value !== undefined;
}

function isOptionGroup(target: OptionGroupType | OptionType<unknown>): target is OptionGroupType {
  return (target as OptionGroupType).id !== undefined && (target as OptionType<unknown>).value === undefined;
}

function SelectComponent<TValue>(props: SelectComponentProps<TValue>): React.JSX.Element {
  const {
    className = '',
    disabled,
    id,
    label,
    loading,
    onChange: handleChange,
    values,
  } = props;
  const renderRef = useRef({ count: 0, value: '' });
  const currentRender = renderRef.current.count;
  const onChange = useEventCallback(
    (event: React.ChangeEvent<HTMLSelectElement> | React.MouseEvent<HTMLSelectElement>) => {
      // Only increment the counter if the server is in control, as the client doesn't need to react to the user selecting the same option.
      const previousValue = renderRef.current.value;
      const options = values.filter(isOption);
      const { value } = event.currentTarget;
      const previousOption = options.find(option => (typeof option.value === 'string'
        ? option.value === previousValue
        : JSON.stringify(option.value) === previousValue)
      ) ?? null;
      const nextOption = options.find(option => (typeof option.value === 'string'
        ? option.value === value
        : JSON.stringify(option.value) === value)
      ) ?? null;
      if (props.serverControlled) {
        renderRef.current.count += 1;
      }
      handleChange(nextOption, previousOption, event);
    },
  );
  const { children, value } = useMemo(() => {
    const groups = values.filter(isOptionGroup);
    const options = values.filter(isOption);
    const rawSelected: unknown = options.find(option => option.selected)?.value ?? (options.find(option =>
      option.default
    ) ?? options[0])?.value ?? null;
    const selected = typeof rawSelected === 'string' ? rawSelected : JSON.stringify(rawSelected);

    // Firefox emits the "click" event for select options. Chromium-based browsers do not.
    const onClick = props.serverControlled
      ? (event: React.MouseEvent<HTMLOptionElement>) => {
        const { value: val } = event.currentTarget;
        // Only run the onChange event handler if the value has not changed, since
        // the "change" event is not natively emitted by any browser when the
        // value has not changed.
        if (val === selected) {
          let target = event.currentTarget.parentElement;
          if (target instanceof HTMLOptGroupElement) {
            target = target.parentElement;
          }
          if (target instanceof HTMLSelectElement) {
            const selectEvent = { ...event, target, currentTarget: target } as React.MouseEvent<
              HTMLSelectElement
            >;
            onChange(selectEvent);
          }
        }
      }
      : undefined;

    renderRef.current.value = selected;
    const ungrouped = options.filter(option => option.groupId == null);
    const grouped = options.filter(option => option.groupId != null).reduce((acc, option) => {
      let group = acc.get(option.groupId!);
      if (!group) {
        acc.set(option.groupId!, group = []);
      }
      group.push(option);
      return acc;
    }, new Map<number, OptionType<TValue>[]>());

    const result = new Array<React.JSX.Element>();
    let index = 0;
    for (const option of ungrouped) {
      index += 1;
      const val = typeof option.value === 'string' ? option.value : JSON.stringify(option.value);
      let lab = (option.label ?? val).trim();
      if (option.default && lab) {
        lab += ' (Default)';
      }
      result.push(
        <option
          data-tooltip-id="tooltip"
          onClick={onClick}
          key={val}
          value={val}
          selected={option.selected}
          disabled={option.disabled}
        >
          {lab}
        </option>,
      );
    }
    for (const [groupId, opt] of grouped) {
      const groupInfo = groups.find(group => group.id === groupId);
      if (!groupInfo) {
        continue;
      }
      if (result.length) {
        result.push(<hr key={`group-divider-${index}`} />);
      }
      index += 1;
      result.push(
        <optgroup label={groupInfo.label} key={groupId} disabled={groupInfo.disabled}>
          {opt.map((option) => {
            const dis = option.disabled || groupInfo.disabled || false;
            const val = typeof option.value === 'string' ? option.value : JSON.stringify(option.value);
            let lab = (option.label ?? val).trim();
            if (option.default && lab) {
              lab += ' (Default)';
            }
            return (
              <option
                data-tooltip-id="tooltip"
                onClick={onClick}
                key={val}
                value={val}
                selected={option.selected}
                disabled={dis}
              >
                {lab}
              </option>
            );
          })}
        </optgroup>,
      );
    }
    return {
      value: selected,
      children: result,
    };
  }, [values, props.serverControlled, onChange]);

  const onClick = useCallback((event: React.MouseEvent<HTMLSelectElement>) => {
    // Disable if the client is in control over the UI.
    if (!props.serverControlled) {
      return;
    }

    // Chromium-based browsers set the clientX and clientY, whereas Firefox does
    // not UNLESS it's clicked on the border of the element without opening the
    // select menu.
    if (event.clientX === 0 && event.clientY === 0) {
      return;
    }

    // Since we can't use the "click" event, we need a way to prevent the check
    // from being triggered when the onChange event handler has already ran.
    if (renderRef.current.count !== currentRender) {
      return;
    }

    // Because Firefox sets the clientX and clientY when you click on the border
    // of the element, we account for that by padding the bounding box by 1px.
    const boundingBox = event.currentTarget.getBoundingClientRect();
    const isWithinBox = event.clientX >= (boundingBox.left - BorderPadding)
      && event.clientX <= (boundingBox.right + BorderPadding)
      && event.clientY >= (boundingBox.top - BorderPadding) && event.clientY <= (boundingBox.bottom + BorderPadding);

    // If the click was not within the bounding box, and the "change" event was
    // not already triggered, then the user clicked on the same value as before,
    // in which case, run the onChange event handler now.
    if (!isWithinBox) {
      onChange(event);
    }
  }, [currentRender, onChange, props.serverControlled]);

  return (
    <label className={`${className} flex h-8 items-center justify-between`} htmlFor={id}>
      {label && (
        <div className="flex justify-center">
          {label}
        </div>
      )}
      {loading
        ? <Icon path={mdiLoading} size={1} spin className="text-panel-text-primary" />
        : (
          <div className={cx('relative', className.includes('w-full') ? 'w-full' : 'w-auto')}>
            <select
              disabled={disabled}
              id={id}
              value={value}
              onChange={onChange}
              onClick={onClick}
              className="focus:outline-hidden w-full appearance-none rounded-sm border border-panel-border bg-panel-input py-1 pl-3 pr-8 text-sm transition ease-in-out focus:border-panel-text-primary focus:shadow-none"
            >
              {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 p-1">
              <Icon path={mdiChevronDown} size={1} />
            </div>
          </div>
        )}
    </label>
  );
}

export default SelectComponent;
