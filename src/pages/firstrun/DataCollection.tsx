import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import Footer from './Footer';
import Checkbox from '../../components/Input/Checkbox';
import TransitionDiv from '../../components/TransitionDiv';

function DataCollection() {
  const dispatch = useDispatch();

  const analyticsOptOut = useSelector((state: RootState) => state.localSettings.GA_OptOutPlzDont);

  return (
    <TransitionDiv className="flex flex-col flex-grow justify-center">
      <div className="font-bold text-lg">Data Collection</div>
      <div className="font-mulish mt-5 pr-2 text-justify">
        Shoko is open-source and is worked on by volunteers in our free time so in order to
        more effectively improve Shoko, we&apos;ve implemented two different services for data
        collection. We understand the hesitations a lot of people have with data collection
        services so we&apos;re listing what services we use and what data we collect.
      </div>
      <div className="font-mulish mt-4 pr-2 text-justify">
        We also want to make something very clear,
        <span className="font-bold"> all data collected is non-identifiable.</span>
        We don’t care about what specific titles you have in your collection or what you
        watch. We only care about making Shoko better which is what this data will allow us
        to do.
      </div>
      <div className="font-mulish mt-4">
        <div className="font-bold">Sentry</div>
        <div className="font-semibold">Note: Cannot be opted-out of.</div>
        <ul>
          <li>- Error information and context</li>
        </ul>
      </div>
      <div className="font-mulish mt-4">
        <div className="font-bold">Google Analytics</div>
        <ul>
          <li>- AniDB - Ban Type (HTTP/UDP)</li>
          <li>- Import - Run Import</li>
          <li>- Import - Run Import (Scan TVDB)</li>
          <li>- Import - Run Import (Scan MovieDB)</li>
          <li>- Import - Run Import (Update TVDB)</li>
          <li>- Import - Run Import (Update All AniDB)</li>
          <li>- Import - Run Import (Update All Stats)</li>
          <li>- Plex - Manually Syncing Plex (Single User)</li>
          <li>- Plex - Token Created</li>
          <li>- Plex - Sync All</li>
          <li>- Server - Startup Status</li>
          <li>- Server - Linux Users</li>
          <li>- Server - Startup Complete</li>
          <li>- Server - Server Shutdown</li>
          <li>- Trakt - Scan for Matches</li>
          <li>- Utility - Removing Missing Files</li>
          <li>- Utility - Validate All Images</li>
        </ul>
      </div>
      <div className="flex items-center my-8">
        <span className="flex mr-6">Allow Shoko To Collect Anonymous Data</span>
        <span className="flex">
          <Checkbox
            id="analyticsOptOut"
            isChecked={!analyticsOptOut}
            onChange={e => dispatch(
              {
                type: Events.SETTINGS_SAVE_SERVER,
                payload: { newSettings: { GA_OptOutPlzDont: !e.target.value } },
              },
            )}
          />
        </span>
      </div>
      <Footer nextPage="" finish />
    </TransitionDiv>
  );
}

export default DataCollection;
