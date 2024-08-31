import React, { useEffect, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { produce } from 'immer';
import { map, pull, toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import toast from '@/components/Toast';
import { useInvalidatePlexTokenMutation } from '@/core/react-query/plex/mutations';
import {
  usePlexLibrariesQuery,
  usePlexLoginUrlQuery,
  usePlexServersQuery,
  usePlexStatusQuery,
} from '@/core/react-query/plex/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';
import useSettingsContext from '@/hooks/useSettingsContext';

const PlexLinkButton = () => {
  const settings = useSettingsQuery().data;

  const [plexPollingInterval, setPlexPollingInterval] = useState(0);

  const loginUrlQuery = usePlexLoginUrlQuery(false);
  const isAuthenticated = usePlexStatusQuery(plexPollingInterval);
  const { isPending: isInvalidateTokenPending, mutate: invalidatePlexToken } = useInvalidatePlexTokenMutation();
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const handleLogin = useEventCallback(() => {
    window.open(loginUrlQuery?.data, '_blank');
    setPlexPollingInterval(1000);
    toast.info('Checking plex login status!', '', {
      autoClose: false,
      draggable: false,
      closeOnClick: false,
      toastId: 'plex-status',
    });
  });

  const invalidateToken = useEventCallback(() => {
    invalidatePlexToken(undefined, {
      onSuccess: () => {
        // Cleanup libraries and server from settings because server won't do so.
        const { Plex: plexSettings } = settings;
        patchSettings({
          newSettings: {
            ...settings,
            Plex: {
              ...plexSettings,
              Libraries: [],
              Server: '',
            },
          },
        });
      },
    });
  });

  const fetchLoginUrl = useEventCallback(() => {
    loginUrlQuery.refetch().catch(console.error);
  });

  useEffect(() => {
    if (isAuthenticated.data) {
      setPlexPollingInterval(0);
      toast.dismiss('plex-status');
    }
  }, [isAuthenticated.data]);

  if (isAuthenticated.data) {
    return (
      <Button
        onClick={invalidateToken}
        loading={isInvalidateTokenPending}
        loadingSize={0.65}
        buttonType="danger"
        buttonSize="small"
      >
        Unlink
      </Button>
    );
  }

  if (loginUrlQuery?.data) {
    return (
      <Button
        onClick={handleLogin}
        loading={plexPollingInterval !== 0}
        loadingSize={0.65}
        buttonType="primary"
        buttonSize="small"
      >
        Login
      </Button>
    );
  }

  return (
    <Button
      onClick={fetchLoginUrl}
      loading={loginUrlQuery.isFetching || isAuthenticated.isFetching}
      loadingSize={0.65}
      buttonType="primary"
      buttonSize="small"
    >
      Authenticate
    </Button>
  );
};

const PlexSettings = () => {
  const { newSettings, setNewSettings } = useSettingsContext();
  const { Plex: plexSettings } = newSettings;

  const [serverId, setServerId] = useState('');

  const settings = useSettingsQuery().data;
  const isAuthenticated = usePlexStatusQuery().data;
  const serversQuery = usePlexServersQuery(isAuthenticated);
  const librariesQuery = usePlexLibrariesQuery(isAuthenticated && serversQuery.isSuccess && !!serverId);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  useEffect(() => {
    if (plexSettings.Server) setServerId(plexSettings.Server);
    else setServerId('');
  }, [plexSettings.Server]);

  const handleServerChange = useEventCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    // Optimistic update
    setServerId(event.target.value);

    // We need to save it without pressing the save button to reload libraries.
    patchSettings({ newSettings: { ...settings, Plex: { ...plexSettings, Server: event.target.value } } }, {
      onSuccess: () => {
        invalidateQueries(['plex', 'libraries']);
      },
    });
  });

  const handleLibraryChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const key = toNumber(event.target.id);

    const libraries = produce(plexSettings.Libraries, (draftState) => {
      if (event.target.checked) draftState.push(key);
      else pull(draftState, key);
    });

    setNewSettings({ ...newSettings, Plex: { ...plexSettings, Libraries: libraries } });
  });

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex justify-between">
        <div className="flex items-center font-semibold">Plex Options</div>
        <PlexLinkButton />
      </div>
      <div className="flex flex-col gap-y-2">
        <div className={cx('flex flex-col gap-y-2', !isAuthenticated && 'pointer-events-none opacity-65')}>
          <SelectSmall
            label="Server"
            id="server"
            value={serverId}
            onChange={handleServerChange}
            isFetching={isAuthenticated && serversQuery.isPending}
          >
            <option value="" disabled>--Select Server--</option>
            {map(
              serversQuery.data,
              server => <option value={server.ClientIdentifier} key={server.ClientIdentifier}>{server.Name}</option>,
            )}
          </SelectSmall>
          <AnimateHeight height={isAuthenticated && serversQuery.isSuccess && !!serverId ? 'auto' : 0}>
            <div className="mb-2">Available Libraries</div>
            <div className="flex flex-col gap-y-2 rounded-lg bg-panel-input px-4 py-2">
              {librariesQuery.isPending && (
                <div className="flex justify-center text-panel-text-primary">
                  <Icon path={mdiLoading} size={1} spin />
                </div>
              )}

              {(librariesQuery.isError || librariesQuery.data?.length === 0) && (
                <div className="flex justify-center">
                  No libraries found!
                </div>
              )}

              {librariesQuery.isSuccess && librariesQuery.data.length > 0
                && map(
                  librariesQuery.data,
                  library => (
                    <Checkbox
                      justify
                      label={library.Title}
                      id={library.Key.toString()}
                      isChecked={newSettings.Plex.Libraries.includes(library.Key)}
                      onChange={handleLibraryChange}
                      key={library.Key}
                    />
                  ),
                )}
            </div>
          </AnimateHeight>
        </div>
      </div>
    </div>
  );
};

export default PlexSettings;
