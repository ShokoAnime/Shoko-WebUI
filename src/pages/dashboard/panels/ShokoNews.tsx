import React from 'react';
import { forEach } from 'lodash';

import FixedPanel from '../../../components/Panels/FixedPanel';

function ShokoNews() {
  const renderRow = (key: string) => (
    <div className="flex justify-between items-center mt-3 first:mt-0" key={key}>
      {key}
    </div>
  );

  const items: Array<React.ReactNode> = [];

  forEach(['Shoko Released', 'Shoko Released', 'Shoko Released', 'Shoko Released'], (action) => {
    items.push(renderRow(action));
  });

  return (
    <FixedPanel title="Shoko News" isFetching={false}>
      {items}
    </FixedPanel>
  );
}

export default ShokoNews;
