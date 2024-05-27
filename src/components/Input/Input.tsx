import React, { useContext, useEffect, useMemo, useRef } from 'react';
import type { PlacesType } from 'react-tooltip';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { BodyVisibleContext } from '@/core/router';

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
    autoFocus,
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
    onKeyUp,
    onToggleOverlay,
    overlayClassName,
    placeholder,
    startIcon,
    type,
    value,
  } = props;

  const bodyVisible = useContext(BodyVisibleContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isShow, setIsShow] = React.useState(false);

  useEffect(() => {
    if (autoFocus && bodyVisible && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [autoFocus, bodyVisible]);

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
        isOverlay && 'flex-row gap-x-2 flex',
      ])}
    >
      <label
        htmlFor={id}
        className={cx(inputContainerClassName)}
      >
        {label && (
          <div
            className={cx('font-semibold text-base', {
              'mb-2': !inline,
              'flex items-center mr-3 whitespace-nowrap': inline,
            })}
          >
            {label}
          </div>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon path={startIcon} size={1} />
            </div>
          )}
          <input
            className={cx([
              inputClassName ?? '',
              'appearance-none bg-panel-input w-full focus:shadow-none focus:outline-none px-4 py-3 rounded-lg transition ease-in-out border border-panel-border focus:ring-2 focus:ring-panel-icon-action focus:ring-inset',
              center && 'text-center',
              startIcon && '!pl-11',
            ])}
            id={id}
            type={type}
            placeholder={placeholder ?? ''}
            value={value}
            onChange={onChange}
            onKeyUp={onKeyUp}
            disabled={disabled}
            ref={inputRef}
          />
          {endIcons?.length && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-row gap-x-2">
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
