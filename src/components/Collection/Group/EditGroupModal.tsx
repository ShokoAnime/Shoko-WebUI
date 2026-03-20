import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import { map } from 'lodash';

import FileActionsTab from '@/components/Collection/Group/EditGroupTabs/FileActionsTab';
import NameTab from '@/components/Collection/Group/EditGroupTabs/NameTab';
import SeriesTab from '@/components/Collection/Group/EditGroupTabs/SeriesTab';
import ModalPanel from '@/components/Panels/ModalPanel';
import { setGroupId } from '@/core/slices/modals/editGroup';
import { useDispatch, useSelector } from '@/core/store';

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

  const groupId = useSelector(state => state.modals.editGroup.groupId);

  const onClose = useCallback(() => {
    if (groupId === -1) return;
    dispatch(setGroupId(-1));
  }, [dispatch, groupId]);

  useEffect(() => onClose, [onClose]);

  const [activeTab, setActiveTab] = useState<keyof typeof tabs>('name');

  return (
    <ModalPanel show={groupId !== -1} onRequestClose={onClose} header="Edit Group" size="md" noPadding noGap>
      <div className="flex h-104 flex-row gap-x-6 p-6">
        <div className="flex shrink-0 gap-y-6 font-semibold">
          <div className="flex flex-col gap-y-1">
            {map(tabs, (value: string, key: keyof typeof tabs) => (
              <div
                className={cx(
                  activeTab === key
                    ? 'w-48 cursor-pointer rounded-lg bg-panel-menu-item-background p-3 text-center text-panel-menu-item-text'
                    : 'w-48 cursor-pointer rounded-lg p-3 text-center transition-colors hover:bg-panel-menu-item-background-hover',
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
