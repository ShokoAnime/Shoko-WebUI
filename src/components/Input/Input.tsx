import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { mdiCloseCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useEventCallback } from 'usehooks-ts';

import { BodyVisibleContext } from '@/core/router';

import Button from './Button';

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
  isOverlay?: boolean;
  overlayClassName?: string;
  onToggleOverlay?: (show: boolean) => void;
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

  const handleOverlayClick = useEventCallback(() => {
    setIsShow(prev => !prev);
    onToggleOverlay?.(!isShow);
  });

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
      className={cx({
        className,
        'flex-row gap-x-2 flex': isOverlay,
      })}
    >
      <label
        htmlFor={id}
        className={cx(inputContainerClassName)}
      >
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
          {(endIcons?.length ?? isOverlay) && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-row gap-x-2">
              {endIcons?.map(icon => (
                <div
                  key={`input-${icon.icon}`}
                  onClick={icon.onClick}
                  className={cx('cursor-pointer text-panel-text', icon.className)}
                >
                  <Icon path={icon.icon} size={1} />
                </div>
              ), [] as React.ReactNode[]) ?? []}
              {isOverlay && isShow && (
                <div
                  key="input-toggler"
                  onClick={handleOverlayClick}
                  className={cx('cursor-pointer text-panel-text 2xl:hidden')}
                >
                  <Icon path={mdiCloseCircleOutline} size={1} />
                </div>
              )}
            </div>
          )}
        </div>
      </label>
      {isOverlay && startIcon && !isShow && (
        <Button
          buttonType="secondary"
          className="inline p-2.5 2xl:hidden"
          onClick={handleOverlayClick}
        >
          <Icon path={startIcon} size={1} />
        </Button>
      )}
    </div>
  );
}

export default Input;
