import React from 'react';

type Props = {
  count: number;
  selected?: number;
  suffix?: string;
  selectedSuffix?: string;
};

const ItemCount = ({ count, selected, selectedSuffix, suffix }: Props) => (
  <div className="text-lg font-semibold">
    <span>
      <span className="text-panel-text-important">
        {count}
        &nbsp;
      </span>
      {suffix && suffix}
      {!suffix && (count === 1 ? 'File' : 'Files')}
    </span>
    {(selected ?? 0) > 0 && (
      <>
        <span>&nbsp;|&nbsp;</span>
        <span>
          <span className="text-panel-text-important">
            {selected ?? 0}
            &nbsp;
          </span>
          {selectedSuffix && `${selectedSuffix} `}
          Selected
        </span>
      </>
    )}
  </div>
);

export default ItemCount;
