import React, { useEffect, useMemo } from 'react';
import type { PlacesType } from 'react-tooltip';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import useAutoFocusRef from '@/hooks/useAutoFocusRef';
import useBodyVisibleContext from '@/hooks/useBodyVisibleContext';

type EndIcon = {
  icon: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  tooltip?: string;
};

type Props = {
  id: string;
  label?: string;
  type: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  center?: boolean;
  endIcons?: EndIcon[];
  startIcon?: string;
  inline?: boolean;
  isOverlay?: boolean;
  overlayClassName?: string;
  onToggleOverlay?: (show: boolean) => void;
};

type TooltipAttributes = {
  'data-tooltip-id': string;
  'data-tooltip-content': string;
  'data-tooltip-place': PlacesType;
};

const Input = React.memo((props: Props) => {
  const {
    autoFocus = false,
    center,
    className,
    disabled,
    endIcons,
    id,
    inline,
    inputClassName,
    isOverlay,
    label,
    onChange,
    onKeyDown,
    onKeyUp,
    onToggleOverlay,
    overlayClassName,
    placeholder,
    startIcon,
    type,
    value,
  } = props;

  const bodyVisible = useBodyVisibleContext();
  const inputRef = useAutoFocusRef(autoFocus && !disabled && bodyVisible);
  const [isShow, setIsShow] = React.useState(false);

  useEffect(() => {
    if (isOverlay) return;
    setIsShow(_ => false);
    onToggleOverlay?.(false);
  }, [isOverlay, onToggleOverlay]);

  const inputContainerClassName = useMemo(() => {
    const combier = (input: string) => cx([overlayClassName, input]);
    if (isOverlay && inline) {
      if (!isShow) return combier('hidden 2xl:flex flex-row justify-center');
      return combier('flex flex-row justify-center');
    }
    if (isOverlay && !inline) {
      if (!isShow) return combier('hidden 2xl:inline');
      return combier('');
    }
    if (!isOverlay && inline) {
      return 'flex flex-row justify-center';
    }

    return '';
  }, [isShow, isOverlay, inline, overlayClassName]);

  return (
    <div
      className={cx([
        className ?? '',
        isOverlay && 'flex flex-row gap-x-2',
      ])}
    >
      <label
        htmlFor={id}
        className={cx(inputContainerClassName)}
      >
        {label && (
          <div
            className={cx('text-base font-semibold', {
              'mb-2': !inline,
              'mr-3 flex items-center whitespace-nowrap': inline,
            })}
          >
            {label}
          </div>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute top-1/2 left-3 -translate-y-1/2">
              <Icon path={startIcon} size={1} />
            </div>
          )}
          <input
            className={cx([
              inputClassName ?? '',
              'w-full appearance-none rounded-lg border border-panel-border bg-panel-input px-4 py-3 transition ease-in-out focus:shadow-none focus:ring-2 focus:ring-panel-icon-action focus:outline-hidden focus:ring-inset',
              center && 'text-center',
              startIcon && 'pl-11!',
            ])}
            id={id}
            type={type}
            placeholder={placeholder ?? ''}
            value={value}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            disabled={disabled}
            ref={inputRef}
          />
          {endIcons?.length && (
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-row gap-x-2">
              {endIcons.map((icon) => {
                let tooltipAttributes: TooltipAttributes | null = null;
                if (icon.tooltip) {
                  tooltipAttributes = {
                    'data-tooltip-id': 'tooltip',
                    'data-tooltip-content': icon.tooltip,
                    'data-tooltip-place': 'top',
                  };
                }
                return (
                  <div
                    key={`input-${icon.icon}`}
                    onClick={icon.onClick}
                    className={cx('cursor-pointer text-panel-text', icon.className)}
                    {...tooltipAttributes}
                  >
                    <Icon path={icon.icon} size={1} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </label>
    </div>
  );
});

export default Input;
