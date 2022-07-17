import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router';
import { replace } from 'connected-react-router';
import { Icon } from '@mdi/react';
import {
  mdiLoading, mdiDiscord,
  mdiCheckboxIntermediateVariant,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
} from '@mdi/js';
import Button from '../../components/Input/Button';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Acknowledgement from './Acknowledgement';
import DatabaseSetup from './DatabaseSetup';
import LocalAccount from './LocalAccount';
import AniDBAccount from './AniDBAccount';
import MetadataSources from './MetadataSources';
import StartServer from './StartServer';
import ImportFolders from './ImportFolders';
import DataCollection from './DataCollection';

function FirstRunPage() {
  const dispatch = useDispatch();

  const isFetchingVersion = useSelector((state: RootState) => state.fetching.serverVersion);
  const version = useSelector((state: RootState) => state.jmmVersion);
  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const status = useSelector((state: RootState) => state.firstrun.serverStatus);
  const saved = useSelector((state: RootState) => state.firstrun.saved);

  useEffect(() => {
    if (status.State !== 4) {
      dispatch(replace('/login'));
      return;
    }

    dispatch({ type: Events.SERVER_VERSION });
    dispatch({ type: Events.SETTINGS_GET_SERVER });
  }, []);

  const renderItem = (text: string, key: string) => (
    <div key={key} className="flex items-center font-semibold mt-4 first:mt-0">
      <Icon
        path={pathname === `/firstrun/${key}` ? mdiCheckboxIntermediateVariant : (saved[key] ? mdiCheckboxMarked : mdiCheckboxBlankOutline)}
        className="text-primary mr-7"
        size={1}
      />
      {text}
    </div>
  );

  return (
    <div className="flex h-screen w-screen">
      <div className="flex flex-col flex-none p-12 items-center justify-between w-125 bg-background-nav border-r-2 border-background-border">
        <div className="flex flex-col items-center">
          <img src="/logo.png" className="w-32" alt="logo" />
          <div className="flex items-center font-semibold mt-4">
            Version: {isFetchingVersion ? <Icon path={mdiLoading} spin size={1} className="ml-2 text-primary" /> : version}
          </div>
        </div>
        <div className="flex flex-col grow justify-center p-4 -mt-24">
          {renderItem('Acknowledgement', 'acknowledgement')}
          {renderItem('Database Setup', 'db-setup')}
          {renderItem('Local Account', 'local-account')}
          {renderItem('AniDB Account', 'anidb-account')}
          {renderItem('Metadata Sources', 'metadata-sources')}
          {renderItem('Start Server', 'start-server')}
          {renderItem('Import Folders', 'import-folders')}
          {renderItem('Data Collection', 'data-collection')}
        </div>
        <div className="flex flex-col w-full">
          <Button className="flex bg-primary items-center justify-center py-2" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
            Get Help on <Icon path={mdiDiscord} size={0.75} className="mx-1" /> Discord
          </Button>
          <Button className="bg-primary py-2 mt-4" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
            Documentation
          </Button>
        </div>
      </div>
      <div className="flex grow">
        <Route exact path="/firstrun">
          <Redirect to="/firstrun/acknowledgement" />
        </Route>
        <Route exact path="/firstrun/acknowledgement" component={Acknowledgement} />
        <Route exact path="/firstrun/db-setup" component={DatabaseSetup} />
        <Route exact path="/firstrun/local-account" component={LocalAccount} />
        <Route exact path="/firstrun/anidb-account" component={AniDBAccount} />
        <Route exact path="/firstrun/metadata-sources" component={MetadataSources} />
        <Route exact path="/firstrun/start-server" component={StartServer} />
        <Route exact path="/firstrun/import-folders" component={ImportFolders} />
        <Route exact path="/firstrun/data-collection" component={DataCollection} />
      </div>
    </div>
  );
}

export default FirstRunPage;
