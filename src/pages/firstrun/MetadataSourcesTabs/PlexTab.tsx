import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/core/store';
import Events from '@/core/events';
import Button from '@/components/Input/Button';
import TransitionDiv from '@/components/TransitionDiv';

import { setItem as setMiscItem } from '@/core/slices/misc';

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
  }, []);

  const handleLinkOpen = () => {
    window.open(plexUrl, '_blank');
    dispatch({ type: Events.START_API_POLLING, payload: { type: 'plex-auth' } });
  };

  const renderPlexUrl = () => {
    if (!plexUrl || plexUrl === '') {
      return (
        <div className="flex justify-between grow items-center">
          Plex Login:
          <Button onClick={() => dispatch({ type: Events.SETTINGS_PLEX_LOGIN_URL })} className="bg-highlight-1 px-2 py-1 text-xs">
            {isFetchingUrl ? 'Requesting...' : 'Authenticate'}
          </Button>
        </div>
      );
    }
    return (
      <div className="flex grow justify-between items-center">
        Plex Login:
        <Button onClick={() => handleLinkOpen()} className="hover:underline py-1 px-2 text-xs"><span className="text-highlight-2">Click here to login</span></Button>
      </div>
    );
  };

  return (
    <TransitionDiv className="flex flex-col w-3/5">
      <div className="flex justify-between">
        {
          !isAuthenticated
            ? renderPlexUrl()
            : (
              <div className="flex grow justify-between items-center">
                Plex Authenticated!
                <Button onClick={() => dispatch({ type: Events.SETTINGS_UNLINK_PLEX })} className="bg-highlight-3 py-1 px-2 text-xs">
                  {isFetchingUnlink ? 'Unlinking...' : 'Unlink'}
                </Button>
              </div>
            )
        }
      </div>
    </TransitionDiv>
  );
}

export default PlexTab;
