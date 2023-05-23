import React from 'react';

const ItemCount = ({ filesCount }: { filesCount: number }) => (
  <div className="font-semibold text-xl">
    <span className="text-highlight-2">{filesCount}&nbsp;</span>Files
  </div>
);

export default ItemCount;
