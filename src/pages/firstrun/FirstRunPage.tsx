import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router';
import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline, mdiCircleHalfFull, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { siDiscord } from 'simple-icons';

import Button from '@/components/Input/Button';
import ShokoIcon from '@/components/ShokoIcon';
import { useServerStatusQuery, useVersionQuery } from '@/core/react-query/init/queries';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { RootState } from '@/core/store';

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
  const navigate = useNavigateVoid();

  const versionQuery = useVersionQuery();
  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { mutateAsync: patchSettings } = usePatchSettingsMutation();
  const [isPersistent, setIsPersistent] = useState(false);
  const serverStatusQuery = useServerStatusQuery();

  useEffect(() => {
    if (
      (serverStatusQuery.isSuccess || serverStatusQuery.isError) && !isPersistent && !serverStatusQuery.isPending
      && serverStatusQuery.data?.State !== 4
    ) {
      navigate('../login', { replace: true });
    }
  }, [
    navigate,
    serverStatusQuery.data,
    serverStatusQuery.isError,
    serverStatusQuery.isPending,
    serverStatusQuery.isSuccess,
    isPersistent,
  ]);

  const [newSettings, setNewSettings] = useState(settings);

  useEffect(() => {
    setNewSettings(settings);
  }, [settings]);

  const updateSetting = (type: string, key: string, value: string) => {
    const tempSettings: Record<string, string | string[] | boolean> = {
      ...(newSettings[type] as Record<string, string | string[] | boolean>),
      [key]: value,
    };
    setNewSettings({ ...newSettings, [type]: tempSettings });
  };

  const saveSettings = async () => {
    await patchSettings({ newSettings, skipValidation: true });
  };

  const parsedVersion = useMemo(() => {
    if (versionQuery.isFetching || !versionQuery.data) {
      return <Icon path={mdiLoading} spin size={1} className="ml-2 text-panel-icon-action" />;
    }

    if (versionQuery.data.Server.ReleaseChannel !== 'Stable') {
      return `${versionQuery.data.Server.Version}-${versionQuery.data.Server.ReleaseChannel} (${
        versionQuery.data.Server.Commit?.slice(0, 7)
      })`;
    }

    return versionQuery.data.Server.Version;
  }, [versionQuery.data, versionQuery.isFetching]);

  return (
    <div className=" flex w-full justify-center">
      <div className="flex size-full max-w-[120rem] gap-x-6 p-6">
        <div className="flex w-[31.25rem] flex-col items-center rounded-lg border border-panel-border bg-panel-background-transparent p-6">
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

        <div className="flex grow flex-col items-center justify-center rounded-lg border border-panel-border bg-panel-background-transparent p-6">
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
      <div className="login-image-default fixed left-0 top-0 -z-10 size-full opacity-20" />
    </div>
  );
}

export default FirstRunPage;
