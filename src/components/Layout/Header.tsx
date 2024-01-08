import React from 'react';
import { useSelector } from 'react-redux';
import { mdiBackburger, mdiMenu, mdiServer } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';

import type { RootState } from '@/core/store';

type Props = {
  showSidebar: boolean;
  toggleSidebar: () => void;
};

function Header({ showSidebar, toggleSidebar }: Props) {
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);

  return (
    <div className="z-[100] flex max-h-15 items-center justify-between bg-topnav-background p-4 drop-shadow-md">
      <Button onClick={toggleSidebar}>
        <Icon path={showSidebar ? mdiBackburger : mdiMenu} size={1} className="text-header-icon" />
      </Button>
      <ShokoIcon className="w-8" />
      <div className="flex items-center">
        <Icon path={mdiServer} size={1} />
        <span className="ml-2 text-header-text-important">
          {queueItems.HasherQueueState.queueCount + queueItems.GeneralQueueState.queueCount
            + queueItems.ImageQueueState.queueCount}
        </span>
      </div>
    </div>
  );
}

export default Header;
