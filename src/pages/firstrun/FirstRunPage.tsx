import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';
import { useGetInitStatusQuery, useGetInitVersionQuery } from '@/core/rtkQuery/splitV3Api/initApi';
import { useGetSettingsQuery, usePatchSettingsMutation } from '@/core/rtkQuery/splitV3Api/settingsApi';
import { initialSettings } from '@/pages/settings/SettingsPage';

import type { RootState } from '@/core/store';
import type { SettingsType } from '@/core/types/api/settings';

type ContextType = {
  fetching: boolean;
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => {};
  updateSetting: (type: string, key: string, value: string) => {};
  saveSettings: () => Promise<void>;
};

const MenuItem = ({ id, text }: { text: string, id: string }) => {
  const { pathname } = useLocation();
  const saved = useSelector((state: RootState) => state.firstrun.saved);

  const path = useMemo(() => {
    if (pathname === `/webui/firstrun/${id}`) return mdiCircleHalfFull;
    if (saved[id]) return mdiCheckboxMarkedCircleOutline;
    return mdiCheckboxBlankCircleOutline;
  }, [pathname, saved, id]);

  return (
    <div key={id} className="flex items-center gap-x-7 font-semibold">
      <Icon
        path={path}
        className="text-panel-primary"
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
    if (!status.isUninitialized && !status.isLoading && status.data?.State !== 4) {
      navigate('../login', { replace: true });
    }
  }, [navigate, status]);

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
    } catch (error) {
      console.error(error);
    }
  };

  const parsedVersion = useMemo(() => {
    if (version.isFetching || !version.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-primary" />;
    }

    if (version.data.Server.ReleaseChannel !== 'Stable') {
      return `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${
        version.data.Server.Commit?.slice(0, 7)
      })`;
    }

    return version.data.Server.Version;
  }, [version]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[120rem] gap-x-8 p-8">
      <div className="flex w-[31.25rem] flex-col items-center border border-panel-border bg-panel-background p-8">
        <div className="flex flex-col items-center gap-y-4">
          <ShokoIcon className="w-32" />
          <div className="flex items-center gap-x-2 font-semibold">
            Version:&nbsp;
            {parsedVersion}
          </div>
        </div>

        <div className="-mt-24 flex grow flex-col justify-center gap-y-4 p-4">
          <MenuItem text="Acknowledgement" id="acknowledgement" />
          <MenuItem text="Local Account" id="local-account" />
          <MenuItem text="AniDB Account" id="anidb-account" />
          <MenuItem text="Metadata Sources" id="metadata-sources" />
          <MenuItem text="Start Server" id="start-server" />
          <MenuItem text="Import Folders" id="import-folders" />
          <MenuItem text="Data Collection" id="data-collection" />
        </div>

        <div className="flex w-full flex-col gap-y-4 font-semibold">
          <Button
            buttonType="primary"
            className="flex items-center justify-center gap-x-1 py-2"
            onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}
          >
            Get Help on&nbsp;
            <Icon path={siDiscord.path} size={0.75} />
            &nbsp;Discord
          </Button>
          <Button
            buttonType="primary"
            className="py-2"
            onClick={() => window.open('https://docs.shokoanime.com', '_blank')}
          >
            Documentation
          </Button>
        </div>
      </div>

      <div className="flex grow flex-col items-center justify-center border border-panel-border bg-panel-background p-8">
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
