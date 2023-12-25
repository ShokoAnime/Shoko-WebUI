/* global globalThis */
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { Outlet } from 'react-router';
import { NavLink, useLocation, useOutletContext } from 'react-router-dom';
import { mdiInformationOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { isEqual } from 'lodash';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setItem as setMiscItem } from '@/core/slices/misc';

import type { SettingsType } from '@/core/types/api/settings';

const items = [
  { name: 'General', path: 'general' },
  { name: 'Import', path: 'import' },
  { name: 'AniDB', path: 'anidb' },
  { name: 'Metadata Sites', path: 'metadata-sites' },
  // { name: 'Display', path: 'display' },
  { name: 'User Management', path: 'user-management' },
  // { name: 'Themes', path: 'themes' },
];

type ContextType = {
  newSettings: SettingsType;
  setNewSettings: (settings: SettingsType) => void;
  updateSetting: (type: string, key: string, value: string | string[] | boolean) => void;
};

function SettingsPage() {
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useState(settings);
  const [showNav, setShowNav] = useState(false);

  const isSm = useMediaQuery({ minWidth: 0, maxWidth: 767 });

  useEffect(() => {
    dispatch(setMiscItem({ webuiPreviewTheme: null }));
    setNewSettings(settings);
  }, [dispatch, settings]);

  const unsavedChanges = useMemo(() => !isEqual(settings, newSettings), [newSettings, settings]);

  const updateSetting = (type: string, key: string, value: string | string[] | boolean) => {
    if (key === 'theme' && typeof value === 'string') {
      globalThis.localStorage.setItem('theme', value);
    }

    const tempSettings: Record<string, string | string[] | boolean> = { ...(newSettings[type] as Record<string, string | string[] | boolean>), [key]: value };
    setNewSettings({ ...newSettings, [type]: tempSettings });

    if (type === 'WebUI_Settings' && key === 'theme') {
      dispatch(setMiscItem({ webuiPreviewTheme: value }));
    }
  };

  return (
    <div className="flex min-h-full grow justify-center gap-x-8" onClick={() => setShowNav(false)}>
      <TransitionDiv
        className="relative top-0 z-10 flex w-72 flex-col gap-y-4 rounded-md border border-panel-border bg-panel-background-transparent p-8 font-semibold"
        show={!(isSm && !showNav)}
        enter={cx(isSm ? 'transition-transform' : 'transition-none')}
        enterFrom="-translate-x-64"
        enterTo="translate-x-0"
      >
        <div className="sticky top-8">
          <div className="mb-8 text-xl opacity-100">Settings</div>
          <div className="flex flex-col gap-y-4">
            {items.map(item => (
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'text-panel-text-primary' : '')}
                key={item.path}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </TransitionDiv>
      {/* {isSm && ( */}
      {/*  <div className="flex justify-center mb-8 font-semibold"> */}
      {/*    Settings */}
      {/*    <Icon path={mdiChevronRight} size={1} className="mx-1" /> */}
      {/*    <div className="flex text-panel-text-primary rounded pl-2 border border-panel-text-primary items-center cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowNav(!showNav); }}> */}
      {/*      {find(items, item => item.path === pathname.split('/').pop())?.name} */}
      {/*      <Icon path={mdiChevronDown} size={1} /> */}
      {/*    </div> */}
      {/*  </div> */}
      {/* )} */}
      <div className="flex min-h-full w-[37.5rem] flex-col gap-y-8 overflow-y-visible rounded-md border border-panel-border bg-panel-background-transparent p-8">
        {settingsQuery.isPending
          ? (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={5} />
            </div>
          )
          : (
            <>
              <Outlet
                context={{
                  newSettings,
                  setNewSettings,
                  updateSetting,
                }}
              />
              {pathname.split('/').pop() !== 'user-management' && (
                <div className="flex max-w-[34rem] justify-end font-semibold">
                  <Button onClick={() => setNewSettings(settings)} buttonType="secondary" className="px-3 py-2">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => patchSettings({ newSettings })}
                    buttonType="primary"
                    className="ml-3 px-3 py-2"
                  >
                    Save
                  </Button>
                </div>
              )}
            </>
          )}
      </div>
      <div
        className={cx(
          'flex w-96 bg-panel-background-transparent border border-panel-border rounded-md p-8 gap-x-2 font-semibold items-center sticky top-0 transition-opacity h-full',
          unsavedChanges ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Icon path={mdiInformationOutline} size={1} className="text-panel-text-primary" />
        Whoa! You Have Unsaved Changes!
      </div>
      <div
        className="fixed left-0 top-0 -z-10 h-full w-full opacity-20"
        style={{ background: 'center / cover no-repeat url(/api/v3/Image/Random/Fanart)' }}
      />
    </div>
  );
}

export function useSettingsContext() {
  return useOutletContext<ContextType>();
}

export default SettingsPage;
