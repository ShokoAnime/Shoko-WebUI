import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';
import { useServerStatusQuery, useVersionQuery } from '@/core/react-query/init/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';

import type { RootState } from '@/core/store';
import type { SettingsType } from '@/core/types/api/settings';

type ContextType = {
  fetching: boolean;
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string) => void;
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
    <div key={id} className="flex items-center gap-x-7 text-xl font-semibold">
      <Icon
        path={path}
        className="text-panel-icon-action"
        size={1}
      />
      {text}
    </div>
  );
};

function FirstRunPage() {
  const navigate = useNavigate();

  const version = useVersionQuery();
  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { mutate: patchSettings } = usePatchSettingsMutation();
  const [isPersistent, setIsPersistent] = useState(false);
  const status = useServerStatusQuery();

  useEffect(() => {
    if ((status.isSuccess || status.isError) && !isPersistent && !status.isLoading && status.data?.State !== 4) {
      navigate('../login', { replace: true });
    }
  }, [navigate, status, isPersistent]);

  const [newSettings, setNewSettings] = useState(settings);

  useEffect(() => {
    setNewSettings(settings);
  }, [settings]);

  const updateSetting = (type: string, key: string, value: string) => {
    const tempSettings = { ...(newSettings[type]), [key]: value };
    setNewSettings({ ...newSettings, [type]: tempSettings });
  };

  const saveSettings = async () => {
    patchSettings({ newSettings, skipValidation: true });
  };

  const parsedVersion = useMemo(() => {
    if (version.isFetching || !version.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-icon-action" />;
    }

    if (version.data.Server.ReleaseChannel !== 'Stable') {
      return `${version.data.Server.Version}-${version.data.Server.ReleaseChannel} (${
        version.data.Server.Commit?.slice(0, 7)
      })`;
    }

    return version.data.Server.Version;
  }, [version]);

  return (
    <div className=" flex w-full justify-center">
      <div className="flex h-full w-full max-w-[120rem] gap-x-8 p-8">
        <div className="flex w-[31.25rem] flex-col items-center rounded-md border border-panel-border bg-panel-background-transparent p-8">
          <div className="flex flex-col items-center gap-y-4">
            <ShokoIcon className="w-32" />
            <div className="flex items-center gap-x-2 font-semibold">
              Version:&nbsp;
              {parsedVersion}
            </div>
          </div>

          <div className="-mt-48 flex grow flex-col justify-center gap-y-4 p-4">
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

        <div className="flex grow flex-col items-center justify-center rounded-md border border-panel-border bg-panel-background-transparent p-8">
          <Outlet
            context={{
              fetching: settingsQuery.isFetching,
              newSettings,
              setIsPersistent,
              setNewSettings,
              updateSetting,
              saveSettings,
            }}
          />
        </div>
      </div>
      <div
        className="fixed left-0 top-0 -z-10 h-full w-full opacity-20"
        style={{ background: 'center / cover no-repeat url(\'/webui/images/OnePiece.png\')' }}
      />
    </div>
  );
}

export function useFirstRunSettingsContext() {
  return useOutletContext<ContextType>();
}

export default FirstRunPage;
