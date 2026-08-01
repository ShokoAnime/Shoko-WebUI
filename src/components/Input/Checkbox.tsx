import { useState } from 'react';
import type { ChangeEventHandler, ReactNode } from 'react';
import type { PlacesType } from 'react-tooltip';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import TransitionDiv from '@/components/TransitionDiv';
import useAutoFocusRef from '@/hooks/useAutoFocusRef';
import useBodyVisibleContext from '@/hooks/useBodyVisibleContext';

type Props = {
  id: string;
  label?: ReactNode;
  labelClassName?: string;
  isChecked: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  labelRight?: boolean;
  justify?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  tooltip?: string;
  tooltipPlace?: PlacesType;
};

const Checkbox = (props: Props) => {
  const {
    autoFocus = false,
    className,
    disabled = false,
    id,
    isChecked,
    justify,
    label,
    labelClassName,
    labelRight,
    onChange,
    tooltip,
    tooltipPlace,
  } = props;
  const bodyVisible = useBodyVisibleContext();
  const inputRef = useAutoFocusRef(autoFocus && !disabled && bodyVisible);
  const [focused, setFocused] = useState(false);

  return (
    <label
      htmlFor={id}
      className={cx([
        justify && 'justify-between',
        `${className}`,
        'flex items-center gap-x-2 transition ease-in-out',
        focused && 'ring-2 ring-panel-icon-action ring-inset',
        disabled && 'opacity-65',
        disabled ? 'cursor-auto' : 'cursor-pointer',
        'h-8',
      ])}
      data-tooltip-id="tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-place={tooltipPlace ?? 'top'}
    >
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        onChange={onChange}
        className="absolute size-0 overflow-hidden border-0 p-0 whitespace-nowrap"
        style={{
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
        }}
        onKeyUp={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        ref={inputRef}
      />
      {!labelRight && (
        <span className={`${labelClassName} flex items-center`}>
          {label}
        </span>
      )}
      {isChecked && (
        <TransitionDiv className="flex text-panel-icon-action" enterFrom="opacity-65" appear={false}>
          <Icon className="text-panel-icon-action" path={mdiCheckboxMarkedCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {!isChecked && (
        <TransitionDiv className="flex text-panel-icon-action" enterFrom="opacity-65" appear={false}>
          <Icon className="text-panel-icon-action" path={mdiCheckboxBlankCircleOutline} size={1} />
        </TransitionDiv>
      )}
      {labelRight && (
        <span className={`${labelClassName} flex items-center`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
