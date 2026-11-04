import { useEffect, useMemo, useRef, useState } from 'react';
/* global globalThis */
import { Outlet, useLocation } from 'react-router';
import useMeasure from 'react-use-measure';
import { isEqual } from 'lodash';
import { useDebounceValue } from 'usehooks-ts';

import SettingsActionBar from '@/components/Settings/SettingsActionBar';
import SettingsBackground from '@/components/Settings/SettingsBackground';
import SettingsContentPanel from '@/components/Settings/SettingsContentPanel';
import SettingsSidebar from '@/components/Settings/SettingsSidebar';
import { emptyMetadataDraft, isMetadataDraftEmpty, saveMetadataDraft } from '@/core/react-query/metadata/draft';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { setItem as setMiscItem } from '@/core/slices/misc';
import { useDispatch } from '@/core/store';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';

import type { SettingValueType } from '@/core/types/context';

const SettingsPage = () => {
  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const toastId = useRef<number | string>(undefined);

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data;
  const { isPending: settingsPatchPending, mutateAsync: patchSettings } = usePatchSettingsMutation();

  const [newSettings, setNewSettings] = useSyncedState(settings);
  // The metadata page's provider changes, kept here so they wait for Save like the settings.
  const [metadataDraft, setMetadataDraft] = useState(emptyMetadataDraft);
  const [isProviderSavePending, setIsProviderSavePending] = useState(false);

  // Clear any leftover theme preview when (re)entering the settings page.
  useEffect(() => {
    dispatch(setMiscItem({ webuiPreviewTheme: null }));
  }, [dispatch]);

  const settingsChanged = useMemo(
    () => {
      // if Username is null, settings haven't been copied yet into newSettings
      if (!settingsQuery.isSuccess || !newSettings?.AniDb.Username) return false;
      return !isEqual(settings, newSettings);
    },
    [newSettings, settings, settingsQuery.isSuccess],
  );
  const unsavedChanges = settingsChanged || !isMetadataDraftEmpty(metadataDraft);
  const [debouncedUnsavedChanges] = useDebounceValue(unsavedChanges, 100);

  const isSpecialPage = useMemo(() => {
    const path = pathname.split('/').pop();
    if (!path) return false;
    if (
      pathname.includes('settings/dynamic/')
      || pathname.includes('settings/plugin-management')
      || pathname.includes('settings/plugin/')
    ) return true;
    return ['user-management', 'api-keys', 'hashing-release', 'dynamic', 'scheduled-actions'].includes(path);
  }, [pathname]);

  const isPluginConfigPage = pathname.includes('settings/plugin/config/');

  // Use debounced value for unsaved changes to avoid flashing the toast for certain changes
  useEffect(() => {
    if (!debouncedUnsavedChanges) {
      if (toastId.current) toast.dismiss(toastId.current);
      return;
    }

    toastId.current = toast.info(
      'Unsaved Changes for Core Settings',
      'Please save before leaving the settings.',
      { autoClose: false, position: 'top-right' },
      true,
    );
  }, [debouncedUnsavedChanges]);

  useEffect(() => () => {
    if (toastId.current) toast.dismiss(toastId.current);
  }, []);

  const updateSetting = (
    type: string,
    key: string,
    value: SettingValueType,
  ) => {
    if (key === 'theme' && typeof value === 'string') {
      globalThis.localStorage.setItem('theme', value);
    }

    const tempSettings: Record<string, SettingValueType> = {
      ...(newSettings[type] as Record<string, SettingValueType>),
      [key]: value,
    };
    setNewSettings({ ...newSettings, [type]: tempSettings });

    if (type === 'WebUI_Settings' && key === 'theme') {
      dispatch(setMiscItem({ webuiPreviewTheme: value }));
    }
  };

  const settingContext = {
    metadataDraft,
    newSettings,
    setMetadataDraft,
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

  // The settings go first, then the provider changes, a source at a time. A failed part shows its error and stays
  // unsaved for another try, while the rest are still sent.
  const saveAll = async () => {
    if (settingsChanged) {
      try {
        await patchSettings(newSettings);
        // The saved theme is now persisted; drop the in-memory preview once the settings round-trip.
        dispatch(setMiscItem({ webuiPreviewTheme: null }));
      } catch {
        // The error is shown by the mutation, and the settings stay unsaved.
      }
    }

    if (!isMetadataDraftEmpty(metadataDraft)) {
      setIsProviderSavePending(true);
      const remaining = await saveMetadataDraft(metadataDraft).catch(() => metadataDraft);
      setMetadataDraft(remaining);
      setIsProviderSavePending(false);
    }
  };

  const validateAndSave = () => {
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

    saveAll().catch(console.error);
  };

  const handleCancel = () => {
    setNewSettings(settings);
    setMetadataDraft(emptyMetadataDraft);
    dispatch(setMiscItem({ webuiPreviewTheme: '' }));
  };

  const [containerRef, containerBounds] = useMeasure();

  return (
    <div className="flex min-h-full grow justify-center gap-x-6" ref={containerRef}>
      <SettingsSidebar />
      <SettingsContentPanel isLoading={settingsQuery.isPending} isPadded={!isPluginConfigPage}>
        <Outlet context={settingContext} />
        {!isSpecialPage && (
          <SettingsActionBar
            canSave={unsavedChanges}
            isSaving={settingsPatchPending || isProviderSavePending}
            onCancel={handleCancel}
            onSave={validateAndSave}
          />
        )}
      </SettingsContentPanel>
      <SettingsBackground containerHeight={containerBounds.height} />
    </div>
  );
};

export default SettingsPage;
