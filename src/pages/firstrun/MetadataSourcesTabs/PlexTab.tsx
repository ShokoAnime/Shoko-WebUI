import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';
import Events from '@/core/events';
import { setItem as setMiscItem } from '@/core/slices/misc';

import type { RootState } from '@/core/store';

function PlexTab() {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.misc.plex.authenticated);
  const isFetchingUnlink = useSelector((state: RootState) => state.fetching.plex_unlink);
  const isFetchingUrl = useSelector((state: RootState) => state.fetching.plex_login_url);
  const plexUrl = useSelector((state: RootState) => state.misc.plex.url);

  useEffect(() => {
    dispatch({ type: Events.SETTINGS_CHECK_PLEX_AUTHENTICATED });
    dispatch(setMiscItem({ plex: { url: '' } }));

    return function cleanup() {
      dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'plex-auth' } });
    };
  }, [dispatch]);

  const handleLinkOpen = () => {
    window.open(plexUrl, '_blank');
    dispatch({ type: Events.START_API_POLLING, payload: { type: 'plex-auth' } });
  };

  const renderPlexUrl = () => {
    if (!plexUrl || plexUrl === '') {
      return (
        <div className="flex grow items-center justify-between">
          Plex Login:
          <Button
            onClick={() => dispatch({ type: Events.SETTINGS_PLEX_LOGIN_URL })}
            buttonType="primary"
            className="px-2 py-1 text-xs"
          >
            {isFetchingUrl ? 'Requesting...' : 'Authenticate'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex grow items-center justify-between">
        Plex Login:
        <Button onClick={() => handleLinkOpen()} buttonType="primary" className="px-2 py-1 text-xs hover:underline">
          Click here to login
        </Button>
      </div>
    );
  };

  return (
    <TransitionDiv className="flex w-3/5 flex-col">
      <div className="flex justify-between">
        {!isAuthenticated
          ? renderPlexUrl()
          : (
            <div className="flex grow items-center justify-between">
              Plex Authenticated!
              <Button
                onClick={() => dispatch({ type: Events.SETTINGS_UNLINK_PLEX })}
                buttonType="danger"
                className="px-2 py-1 text-xs"
              >
                {isFetchingUnlink ? 'Unlinking...' : 'Unlink'}
              </Button>
            </div>
          )}
      </div>
    </TransitionDiv>
  );
}

export default PlexTab;
