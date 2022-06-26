import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router';
import { replace } from 'connected-react-router';
import { Icon } from '@mdi/react';
import {
  mdiLoading, mdiDiscord, mdiCheckboxBlankCircle,
  mdiCheckboxBlankCircleOutline, 
} from '@mdi/js';
import Button from '../../components/Input/Button';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Acknowledgement from './Acknowledgement';
import DatabaseSetup from './DatabaseSetup';
import LocalAccount from './LocalAccount';
import AniDBAccount from './AniDBAccount';
import CommunitySites from './CommunitySites';
import StartServer from './StartServer';
import ImportFolders from './ImportFolders';
import DataCollection from './DataCollection';

function FirstRunPage() {
  const dispatch = useDispatch();

  const isFetchingVersion = useSelector((state: RootState) => state.fetching.serverVersion);
  const version = useSelector((state: RootState) => state.jmmVersion);
  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const status = useSelector((state: RootState) => state.firstrun.serverStatus);

  useEffect(() => {
    if (status.State !== 4) {
      dispatch(replace('/login'));
      return;
    }

    dispatch({ type: Events.SERVER_VERSION });
    dispatch({ type: Events.SETTINGS_GET_SERVER });
  }, []);

  const renderItem = (text: string, key: string) => (
    <div key={key} className="flex items-center text-lg font-semibold mt-8 first:mt-0">
      <Icon
        path={pathname === `/firstrun/${key}` ? mdiCheckboxBlankCircle : mdiCheckboxBlankCircleOutline}
        className="text-highlight-1 mr-7"
        size={1}
      />
      {text}
    </div>
  );

  return (
    <div className="flex h-screen w-screen">
      <div className="flex grow">
        <Route exact path="/firstrun">
          <Redirect to="/firstrun/acknowledgement" />
        </Route>
        <Route exact path="/firstrun/acknowledgement" component={Acknowledgement} />
        <Route exact path="/firstrun/db-setup" component={DatabaseSetup} />
        <Route exact path="/firstrun/local-account" component={LocalAccount} />
        <Route exact path="/firstrun/anidb-account" component={AniDBAccount} />
        <Route exact path="/firstrun/community-sites" component={CommunitySites} />
        <Route exact path="/firstrun/start-server" component={StartServer} />
        <Route exact path="/firstrun/import-folders" component={ImportFolders} />
        <Route exact path="/firstrun/data-collection" component={DataCollection} />
      </div>
      <div className="flex flex-col flex-none px-13 items-center justify-between w-125 bg-background-nav border-l-2 border-background-border">
        <img src="/logo.png" className="w-32 mt-16" alt="logo" />
        <div className="flex items-center font-rubik font-semibold mt-6">
          Version: {isFetchingVersion ? <Icon path={mdiLoading} spin size={1} className="ml-2 text-highlight-1" /> : version}
        </div>
        <div className="flex flex-col flex-grow justify-center -mt-16">
          <div className="flex flex-col">
            {renderItem('Acknowledgement', 'acknowledgement')}
            {renderItem('Database Setup', 'db-setup')}
            {renderItem('Local Account', 'local-account')}
            {renderItem('AniDB Account', 'anidb-account')}
            {renderItem('Community Sites', 'community-sites')}
            {renderItem('Start Server', 'start-server')}
            {renderItem('Import Folders', 'import-folders')}
            {renderItem('Data Collection', 'data-collection')}
          </div>
        </div>
        <div className="flex flex-col w-full pb-13">
          <Button className="bg-highlight-2 py-2" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
            Documentation
          </Button>
          <Button className="flex bg-highlight-2 mt-5 items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
            Get help on <Icon path={mdiDiscord} size={0.75} className="mx-1" /> Discord
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FirstRunPage;
