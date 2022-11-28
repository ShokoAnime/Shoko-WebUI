import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useOutletContext } from 'react-router-dom';
import { replace } from '@lagunovsky/redux-react-router';
import { Icon } from '@mdi/react';
import {
  mdiLoading, mdiCircleHalfFull,
  mdiCheckboxBlankCircleOutline,
  mdiCheckboxMarkedCircleOutline,
} from '@mdi/js';
import { siDiscord } from 'simple-icons/icons';
import Button from '../../components/Input/Button';
import ShokoIcon from '../../components/ShokoIcon';

import { RootState } from '../../core/store';

import { useGetInitVersionQuery, useGetInitStatusQuery } from '../../core/rtkQuery/splitV3Api/initApi';
import { useGetSettingsQuery, usePatchSettingsMutation } from '../../core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '../settings/SettingsPage';
import type { SettingsType } from '../../core/types/api/settings';

type ContextType = {
  fetching: boolean
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => {};
  updateSetting: (type: string, key: string, value: string) => {};
  saveSettings: () => Promise<void>;
};

function FirstRunPage() {
  const dispatch = useDispatch();

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const saved = useSelector((state: RootState) => state.firstrun.saved);

  const version = useGetInitVersionQuery();
  const settingsQuery = useGetSettingsQuery();
  const settings = settingsQuery?.data ?? initialSettings;
  const [patchSettings] = usePatchSettingsMutation();
  const status = useGetInitStatusQuery();

  useEffect(() => {
    if (!status.isUninitialized && !status.isLoading && status.data?.State !== 4) dispatch(replace('login'));
  }, [status.isLoading]);

  const [newSettings, setNewSettings] = useState(initialSettings);

  useEffect(() => {
    setNewSettings(settings);
  }, [settings]);

  const updateSetting = (type: string, key: string, value: string) => {
    const tempSettings = { ...(newSettings[type]), [key]: value };
    setNewSettings({ ...newSettings, [type]: tempSettings });
  };

  const saveSettings = async () => {
    await patchSettings({ oldSettings: settings, newSettings, skipValidation: true });
    settingsQuery.refetch().catch(() => {});
  };

  const renderItem = (text: string, key: string) => (
    <div key={key} className="flex items-center font-semibold mt-4 first:mt-0">
      <Icon
        path={pathname === `/webui/firstrun/${key}` ? mdiCircleHalfFull : (saved[key] ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline)}
        className="text-highlight-1 mr-7"
        size={1}
      />
      {text}
    </div>
  );

  return (
    <div className="flex h-screen w-screen">
      <div className="flex flex-col flex-none p-12 items-center justify-between w-125 bg-background-nav border-r-2 border-background-border">
        <div className="flex flex-col items-center">
          <ShokoIcon className="w-32" />
          <div className="flex items-center font-semibold mt-4">
            Version: {version.isFetching || !version.data ?
              <Icon path={mdiLoading} spin size={1} className="ml-2 text-highlight-1" /> :
            version.data.Server.ReleaseChannel !== 'Stable' ?
              `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${version.data.Server.Commit?.slice(0, 7)})` :
              version.data.Server.Version
            }
          </div>
        </div>
        <div className="flex flex-col grow justify-center p-4 -mt-24">
          {renderItem('Acknowledgement', 'acknowledgement')}
          {renderItem('Database Setup', 'db-setup')}
          {renderItem('Local Account', 'local-account')}
          {renderItem('AniDB Account', 'anidb-account')}
          {renderItem('Metadata Sources', 'metadata-sources')}
          {renderItem('Start Server', 'start-server')}
          {renderItem('Import Folders', 'import-folders')}
          {renderItem('Data Collection', 'data-collection')}
        </div>
        <div className="flex flex-col w-full">
          <Button className="flex bg-highlight-1 items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
            Get Help on <Icon path={siDiscord.path} size={0.75} className="mx-1" /> Discord
          </Button>
          <Button className="bg-highlight-1 py-2 mt-4" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
            Documentation
          </Button>
        </div>
      </div>
      <div className="flex grow justify-center">
        <Outlet
          context={{
            fetching: settingsQuery.isLoading,
            newSettings,
            setNewSettings,
            updateSetting,
            saveSettings,
          }}
        />
      </div>
    </div>
  );
}

export function useFirstRunSettingsContext() {
  return useOutletContext<ContextType>();
}

export default FirstRunPage;
