import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router';
import { replace } from 'connected-react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle as faCircleSolid, faCheckCircle, faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
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

  const pathname = useSelector((state: RootState) => state.router.location.pathname);
  const saved = useSelector((state: RootState) => state.firstrun.saved);
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
    <div key={key} className="py-4 text-lg font-bold flex cursor-default items-center">
      <FontAwesomeIcon
        icon={
          // eslint-disable-next-line no-nested-ternary
          pathname === `/firstrun/${key}` ? faCircleSolid
            : (saved[key] ? faCheckCircle : faCircle)
        }
        className="mr-5 color-highlight-1 text-xl"
      />
      {text}
    </div>
  );

  return (
    <div className="flex h-screen w-screen">
      <div className="flex flex-col w-1/4 bg-color-alt items-center">
        <img src="/logo.png" className="w-32 mt-24" alt="logo" />
        <div className="flex flex-col flex-grow mt-24 justify-between">
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
          <div className="flex pb-6 items-center font-semibold text-lg">
            Get Support:
            <Button className="color-highlight-1 ml-4 text-2xl" onClick={() => window.open('https://discord.gg/vpeHDsg', '_blank')}>
              <FontAwesomeIcon icon={faDiscord} />
            </Button>
            <Button className="color-highlight-1 ml-4 text-2xl" onClick={() => window.open('https://docs.shokoanime.com', '_blank')}>
              <FontAwesomeIcon icon={faGlobe} />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex w-3/4 bg-color-2 justify-center px-80 py-16">
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
    </div>
  );
}

export default FirstRunPage;
