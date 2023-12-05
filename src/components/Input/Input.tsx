import React, { useContext, useEffect, useRef } from 'react';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { BodyVisibleContext } from '@/core/router';

type Props = {
  id: string;
  label?: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  center?: boolean;
  endIcons?: { icon: string, className?: string, onClick?: React.MouseEventHandler<HTMLDivElement> }[];
  startIcon?: string;
  inline?: boolean;
};

function Input(props: Props) {
  const {
    autoFocus,
    center,
    className,
    disabled,
    endIcons,
    id,
    inline,
    inputClassName,
    label,
    onChange,
    onKeyUp,
    placeholder,
    startIcon,
    type,
    value,
  } = props;

  const bodyVisible = useContext(BodyVisibleContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && bodyVisible && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [autoFocus, bodyVisible]);

  return (
    <div className={className}>
      <label htmlFor={id} className={cx({ 'flex flex-row justify-center': inline })}>
        {label && (
          <div
            className={cx('font-semibold text-base', {
              'mb-3': !inline,
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
              inputClassName,
              'appearance-none bg-panel-input w-full focus:shadow-none focus:outline-none px-3 py-2 rounded transition ease-in-out border border-panel-border focus:ring-2 focus:ring-panel-icon-action focus:ring-inset',
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
              {endIcons.map(icon => (
                <div
                  key={`input-${icon.icon}`}
                  onClick={icon.onClick}
                  className={cx('cursor-pointer text-panel-text', icon.className)}
                >
                  <Icon path={icon.icon} size={1} />
                </div>
              ), [] as React.ReactNode[])}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

export default Input;
