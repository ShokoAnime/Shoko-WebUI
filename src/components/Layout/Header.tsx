import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiBackburger, mdiMenu, mdiServer } from '@mdi/js';

import ShokoIcon from '../ShokoIcon';
import Button from '../Input/Button';

import { RootState } from '../../core/store';

type Props = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
};

function Header({ showSidebar, setShowSidebar }: Props) {
  const queueItems = useSelector((state: RootState) => state.mainpage.queueStatus);

  return (
    <div className="flex justify-between bg-background-nav drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-4 items-center z-[100] max-h-15">
      <Button onClick={() => setShowSidebar(!showSidebar)}>
        <Icon path={showSidebar ? mdiBackburger : mdiMenu} size={1} className="text-font-main" />
      </Button>
      <ShokoIcon className="w-8" />
      <div className="flex items-center">
        <Icon path={mdiServer} size={1} />
        <span className="ml-2 text-highlight-2">{(queueItems.HasherQueueCount + queueItems.GeneralQueueCount + queueItems.ImageQueueCount) ?? 0}</span>
      </div>
    </div>
  );
}

export default Header;
