import React from 'react';
import { forEach } from 'lodash';

import FixedPanel from '../../../components/Panels/FixedPanel';

function ShokoNews() {
  const renderRow = (key: string) => (
    <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
      Shoko Released
    </div>
  );

  const items: Array<React.ReactNode> = [];

  forEach(['key1', 'key2', 'key3', 'key4'], (action) => {
    items.push(renderRow(action));
  });

  return (
    <FixedPanel title="Shoko News" isFetching={false}>
      {items}
    </FixedPanel>
  );
}

export default ShokoNews;
