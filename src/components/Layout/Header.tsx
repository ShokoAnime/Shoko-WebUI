import React from 'react';
import { useSelector } from 'react-redux';
import { mdiBackburger, mdiMenu, mdiServer } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';

import type { RootState } from '@/core/store';

type Props = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
};

function Header({ setShowSidebar, showSidebar }: Props) {
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);

  return (
    <div className="z-[100] flex max-h-15 items-center justify-between bg-topnav-background p-4 drop-shadow-md">
      <Button onClick={() => setShowSidebar(!showSidebar)}>
        <Icon path={showSidebar ? mdiBackburger : mdiMenu} size={1} className="text-header-text" />
      </Button>
      <ShokoIcon className="w-8" />
      <div className="flex items-center">
        <Icon path={mdiServer} size={1} />
        <span className="ml-2 text-header-text-important">
          {(queueItems.HasherQueueState.queueCount + queueItems.GeneralQueueState.queueCount
            + queueItems.ImageQueueState.queueCount) ?? 0}
        </span>
      </div>
    </div>
  );
}

export default Header;
