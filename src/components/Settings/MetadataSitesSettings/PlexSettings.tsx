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
import useEventCallback from '@/hooks/useEventCallback';
import { useSettingsContext } from '@/pages/settings/SettingsPage';

const PlexLinkButton = () => {
  const [plexPollingInterval, setPlexPollingInterval] = useState(0);

  const loginUrlQuery = usePlexLoginUrlQuery(false);
  const isAuthenticated = usePlexStatusQuery(plexPollingInterval);
  const { isPending: isInvalidateTokenPending, mutate: invalidatePlexToken } = useInvalidatePlexTokenMutation();

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
    invalidatePlexToken();
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
        className="h-8 w-16 text-xs font-semibold"
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
        className="h-8 w-24 text-xs"
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
      className="h-8 w-24 text-xs"
    >
      Authenticate
    </Button>
  );
};

const PlexSettings = () => {
  const { newSettings, setNewSettings } = useSettingsContext();
  const { Plex: plexSettings } = newSettings;

  const [serverId, setServerId] = useState('');

  const isAuthenticated = usePlexStatusQuery().data;
  const serversQuery = usePlexServersQuery(isAuthenticated);
  const librariesQuery = usePlexLibrariesQuery(isAuthenticated && !!serverId);
  const { mutate: patchSettings } = usePatchSettingsMutation();

  useEffect(() => {
    if (plexSettings.Server) setServerId(plexSettings.Server);
  }, [plexSettings.Server]);

  const handleServerChange = useEventCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    // Optimistic update
    setServerId(event.target.value);

    const tempSettings = produce(newSettings, (draftState) => {
      draftState.Plex.Server = event.target.value;
    });

    // We need to save it without pressing the save button to reload libraries.
    patchSettings({ newSettings: tempSettings }, {
      onSuccess: () => {
        invalidateQueries(['plex', 'libraries']);
      },
    });
  });

  const handleLibraryChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const key = toNumber(event.target.id);

    const tempSettings = produce(newSettings, (draftState) => {
      if (event.target.checked) draftState.Plex.Libraries.push(key);
      else pull(draftState.Plex.Libraries, key);
    });

    setNewSettings(tempSettings);
  });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="font-semibold">Plex Options</div>
      <div className="flex flex-col gap-y-2 border-b border-panel-border pb-8">
        <div className="flex h-8 justify-between">
          <div className="mx-0 my-auto">Plex Link</div>
          <PlexLinkButton />
        </div>
        <div className={cx('flex flex-col gap-y-2', !isAuthenticated && 'pointer-events-none opacity-50')}>
          <SelectSmall
            label="Server"
            id="server"
            value={serverId}
            onChange={handleServerChange}
          >
            <option value="" disabled>--Select Server--</option>
            {map(
              serversQuery.data,
              server => <option value={server.ClientIdentifier} key={server.ClientIdentifier}>{server.Name}</option>,
            )}
          </SelectSmall>
          <AnimateHeight height={isAuthenticated && !!serverId ? 'auto' : 0}>
            <div className="my-2 font-semibold">Libraries</div>
            <div className="flex flex-col gap-y-2 rounded-md border border-panel-border bg-panel-input p-4">
              {librariesQuery.isFetching && (
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
