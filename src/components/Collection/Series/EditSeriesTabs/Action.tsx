import React from 'react';
import cx from 'classnames';

const Action = (
  { description, name, onClick, scroll }: { name: string, description: string, scroll?: boolean, onClick: () => void },
) => (
  <div
    className={cx(
      'flex flex-row justify-between gap-y-2 cursor-pointer hover:text-panel-text-primary transition-colors',
      scroll ? 'mr-4' : '',
    )}
    onClick={onClick}
  >
    <div className="flex w-full flex-col gap-y-1">
      <div className="flex justify-between">
        <div>{name}</div>
      </div>
      <div className="text-sm text-panel-text opacity-65">{description}</div>
    </div>
  </div>
);

export default React.memo(Action);
