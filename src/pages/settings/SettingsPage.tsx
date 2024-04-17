/* global globalThis */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router';
import { NavLink, useLocation } from 'react-router-dom';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isEqual } from 'lodash';

import Button from '@/components/Input/Button';
import toast from '@/components/Toast';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setItem as setMiscItem } from '@/core/slices/misc';
import useEventCallback from '@/hooks/useEventCallback';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata Sites', path: 'metadata-sites' },
  { name: 'Collection', path: 'collection' },
  // { name: 'Display', path: 'display' },
  { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
  { name: 'API Keys', path: 'api-keys' },
];

function SettingsPage() {
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const toastId = useRef<number | string>();

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(settings);

  useEffect(() => {
    dispatch(setMiscItem({ webuiPreviewTheme: null }));
    setNewSettings(settings);
  }, [dispatch, settings]);

  const unsavedChanges = useMemo(
    () => {
      // if Username is null, settings haven't been copied yet into newSettings
      if (!settingsQuery.isSuccess || !newSettings?.AniDb.Username) return false;
      return !isEqual(settings, newSettings);
    },
    [newSettings, settings, settingsQuery.isSuccess],
  );

  useEffect(() => {
    if (!unsavedChanges) {
      if (toastId.current) toast.dismiss(toastId.current);
      return;
    }

    toastId.current = toast.info(
      'Unsaved Changes',
      'Please save before leaving this page.',
      { autoClose: false },
    );
  }, [unsavedChanges]);

  useEffect(() => () => {
    if (toastId.current) toast.dismiss(toastId.current);
  }, []);

  const updateSetting = (type: string, key: string, value: string | string[] | boolean) => {
    if (key === 'theme' && typeof value === 'string') {
      globalThis.localStorage.setItem('theme', value);
    }

    const tempSettings: Record<string, string | string[] | boolean> = {
      ...(newSettings[type] as Record<string, string | string[] | boolean>),
      [key]: value,
    };
    setNewSettings({ ...newSettings, [type]: tempSettings });

    if (type === 'WebUI_Settings' && key === 'theme') {
      dispatch(setMiscItem({ webuiPreviewTheme: value }));
    }
  };

  const isShowFooter = useMemo(() => {
    const path = pathname.split('/').pop();
    if (!path) return true;
    return !['user-management', 'api-keys'].includes(path);
  }, [pathname]);

  const settingContext = {
    newSettings,
    setNewSettings,
    updateSetting,
  };

  const isHttpServerUrlValid = () => {
    try {
      const HttpServerUrl = new URL(newSettings.AniDb.HTTPServerUrl);

      if (HttpServerUrl.protocol !== 'http:' && HttpServerUrl.protocol !== 'https:') {
        return false;
      }

      return true;
    } catch (_) {
      return false;
    }
  };

  const validateAndPatchSettings = useEventCallback(() => {
    if (!isHttpServerUrlValid()) {
      toast.error(
        'Invalid HTTP Server URL',
        <div className="flex flex-col gap-y-4">
          {'It must be in the following format: {scheme}://{address}:{port}'}
          <div>
            Scheme: `http` or `https`
            <br />
            Port: optional
            <br />
          </div>
          <span>eg., http://api.anidb.net:9001</span>
        </div>,
      );

      return;
    }

    patchSettings({ newSettings });
  });

  return (
    <div className="flex min-h-full grow justify-center gap-x-6">
      <div className="relative top-0 z-10 flex w-[21.875rem] flex-col gap-y-4 rounded-lg border border-panel-border bg-panel-background-transparent p-6 font-semibold">
        <div className="sticky top-6">
          <div className="mb-8 text-center text-xl opacity-100">Settings</div>
          <div className="flex flex-col items-center gap-y-2">
            {items.map(item => (
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive
                  ? 'w-full text-center bg-panel-menu-item-background py-2 px-2 rounded-lg text-panel-menu-item-text'
                  : 'w-full text-center py-2 px-2 rounded-lg hover:bg-panel-menu-item-background-hover')}
                key={item.path}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-h-full w-[43.75rem] flex-col gap-y-6 overflow-y-visible rounded-lg border border-panel-border bg-panel-background-transparent p-6">
        {settingsQuery.isPending
          ? (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={5} />
            </div>
          )
          : (
            <>
              <Outlet
                context={settingContext}
              />
              {isShowFooter && (
                <div className="flex justify-end gap-x-3 font-semibold">
                  <Button
                    onClick={() => setNewSettings(settings)}
                    buttonType="secondary"
                    buttonSize="normal"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={validateAndPatchSettings}
                    buttonType="primary"
                    buttonSize="normal"
                    disabled={!unsavedChanges}
                  >
                    Save
                  </Button>
                </div>
              )}
              <div
                className="fixed left-0 top-0 -z-10 size-full opacity-20"
                style={{ background: 'center / cover no-repeat url(/api/v3/Image/Random/Fanart)' }}
              />
            </>
          )}
      </div>
    </div>
  );
}

export default SettingsPage;
