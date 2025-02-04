import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { map } from 'lodash';

import FileActionsTab from '@/components/Collection/Group/EditGroupTabs/FileActionsTab';
import NameTab from '@/components/Collection/Group/EditGroupTabs/NameTab';
import SeriesTab from '@/components/Collection/Group/EditGroupTabs/SeriesTab';
import ModalPanel from '@/components/Panels/ModalPanel';
import { setGroupId } from '@/core/slices/modals/editGroup';
import useEventCallback from '@/hooks/useEventCallback';

import type { RootState } from '@/core/store';

const tabs = {
  name: 'Name',
  series: 'Series',
  file_actions: 'File Actions',
};

const renderTab = (activeTab: string, groupId: number) => {
  if (groupId === -1) {
    return null;
  }

  switch (activeTab) {
    case 'series':
      return <SeriesTab groupId={groupId} />;
    case 'file_actions':
      return <FileActionsTab groupId={groupId} />;
    case 'name':
    default:
      return <NameTab groupId={groupId} />;
  }
};

const EditGroupModal = () => {
  const dispatch = useDispatch();

  const groupId = useSelector((state: RootState) => state.modals.editGroup.groupId);

  const onClose = useEventCallback(() => {
    if (groupId === -1) return;
    dispatch(setGroupId(-1));
  });

  useEffect(() => onClose, [onClose]);

  const [activeTab, setActiveTab] = useState<keyof typeof tabs>('name');

  return (
    <ModalPanel show={groupId !== -1} onRequestClose={onClose} header="Edit Group" size="md" noPadding noGap>
      <div className="flex h-[26rem] flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(tabs, (value: string, key: keyof typeof tabs) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-[12rem] text-center bg-panel-menu-item-background p-3 rounded-lg text-panel-menu-item-text cursor-pointer'
                    : 'w-[12rem] text-center p-3 rounded-lg hover:bg-panel-menu-item-background-hover cursor-pointer transition-colors',
                )}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <div className="border-r border-panel-border" />
        <div className="grow">
          {renderTab(activeTab, groupId)}
        </div>
      </div>
    </ModalPanel>
  );
};

export default EditGroupModal;
