import { Icon } from '@mdi/react';
import { mdiLoading } from '@mdi/js';
import React from 'react';

const GroupPlaceholder = ({ id, style }) => (
  <div key={id} style={style}>
    <div className="mr-4 last:mr-0 shrink-0 h-[20.8125] w-[13.0625rem] items-center justify-center flex flex-col border border-black">
      <Icon path={mdiLoading} spin size={1} />
    </div>
  </div>
);

export default GroupPlaceholder;