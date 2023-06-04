import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull, mdiLoading } from '@mdi/js';
import { siDiscord } from 'simple-icons';
import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';

import { RootState } from '@/core/store';

import { useGetInitStatusQuery, useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '../settings/SettingsPage';
import type { SettingsType } from '@/core/types/api/settings';

type ContextType = {
  fetching: boolean
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => {};
  updateSetting: (type: string, key: string, value: string) => {};
  saveSettings: () => Promise<void>;
};

const MenuItem = ({ text, id }: { text: string, id: string }) => {
  const { pathname } = useLocation();
  const saved = useSelector((state: RootState) => state.firstrun.saved);

  return (
    <div key={id} className="flex items-center font-semibold gap-x-7">
      <Icon
        path={pathname === `/webui/firstrun/${id}` ? mdiCircleHalfFull : (saved[id] ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline)}
        className="text-highlight-1"
        size={1}
      />
      {text}
    </div>
  );
};

function FirstRunPage() {
  const navigate = useNavigate();

  const version = useGetInitVersionQuery();
  const settingsQuery = useGetSettingsQuery();
  const settings = settingsQuery?.data ?? initialSettings;
  const [patchSettings] = usePatchSettingsMutation();
  const status = useGetInitStatusQuery();

  useEffect(() => {
    if (!status.isUninitialized && !status.isLoading && status.data?.State !== 4)
      navigate('../login', { replace: true });
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
    try {
      await patchSettings({ oldSettings: settings, newSettings, skipValidation: true }).unwrap();
      await settingsQuery.refetch();
    } catch (error) {}
  };

  return (
    <div className="flex w-full h-full p-8 gap-x-8 max-w-[120rem] mx-auto">

      <div className="flex flex-col items-center p-8 bg-background-alt border border-background-border w-[31.25rem]">
        <div className="flex flex-col items-center gap-y-4">
          <ShokoIcon className="w-32" />
          <div className="flex items-center font-semibold gap-x-2">
            Version: {version.isFetching || !version.data ?
              <Icon path={mdiLoading} spin size={1} className="text-highlight-1" /> :
            version.data.Server.ReleaseChannel !== 'Stable' ?
              `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${version.data.Server.Commit?.slice(0, 7)})` :
              version.data.Server.Version
            }
          </div>
        </div>

        <div className="flex flex-col grow justify-center p-4 gap-y-4 -mt-24">
          <MenuItem text="Acknowledgement" id="acknowledgement" />
          <MenuItem text="Local Account" id="local-account" />
          <MenuItem text="AniDB Account" id="anidb-account" />
          <MenuItem text="Metadata Sources" id="metadata-sources" />
          <MenuItem text="Start Server" id="start-server" />
          <MenuItem text="Import Folders" id="import-folders" />
          <MenuItem text="Data Collection" id="data-collection" />
        </div>

        <div className="flex flex-col w-full gap-y-4 font-semibold">
          <Button className="flex bg-highlight-1 items-center justify-center py-2 gap-x-1" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
            Get Help on <Icon path={siDiscord.path} size={0.75} /> Discord
          </Button>
          <Button className="bg-highlight-1 py-2 border border-background-border" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
            Documentation
          </Button>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 bg-background-alt border border-background-border grow">
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
