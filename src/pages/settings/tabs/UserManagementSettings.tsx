import React from 'react';
import { Icon } from '@mdi/react';
import { mdiCircleEditOutline, mdiMinusCircleOutline } from '@mdi/js';

import { useSettingsContext } from '../SettingsPage';

import ShokoPanel from '../../../components/Panels/ShokoPanel';

import { useGetUsersQuery } from '../../../core/rtkQuery/userApi';

function UserManagementSettings() {
  const { fetching } = useSettingsContext();

  const usersQuery = useGetUsersQuery();
  const users = usersQuery.data ?? [];

  return (
    <>
      <ShokoPanel title="Current Users" isFetching={fetching}>
        {users.map(user => (
          <div className="flex justify-between mt-3 first:mt-0">
            <div>{user.Username}</div>
            <div className="flex">
              <Icon path={mdiCircleEditOutline} size={1} className="text-highlight-1 mr-2" />
              <Icon path={mdiMinusCircleOutline} size={1} className="text-highlight-3" />
            </div>
          </div>
        ))}
      </ShokoPanel>
    </>
  );
}

export default UserManagementSettings;
