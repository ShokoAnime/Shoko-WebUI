import React from 'react';

const ItemCount = ({ filesCount, series = false }: { filesCount: number, series?: boolean }) => (
  <div className="font-semibold text-xl">
    <span className="text-panel-important">{filesCount}&nbsp;</span>{series ? 'Series' : 'Files'}
  </div>
);

export default ItemCount;
