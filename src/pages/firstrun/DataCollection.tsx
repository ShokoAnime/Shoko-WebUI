import React from 'react';

import Footer from './Footer';
import Checkbox from '../../components/Input/Checkbox';

type State = {
  collectData: boolean,
};

class DataCollection extends React.Component<{}, State> {
  state = {
    collectData: true,
  };

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign({}, prevState, { [name]: value }));
  };

  render() {
    const { collectData } = this.state;
    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow pt-10 px-10 pb-5 overflow-y-auto">
          <div className="font-bold text-lg">Data Collection</div>
          <div className="overflow-y-auto">
            <div className="font-muli mt-5">
              Shoko is open-source and is worked on by volunteers in our free time so in order to
              more effectively improve Shoko, we&apos;ve implemented two different services for data
              collection. We understand the hesitations a lot of people have with data collection
              services so we&apos;re listing what services we use and what data we collect.
            </div>
            <div className="font-muli mt-4">
              We also want to make something very clear,
              <span className="font-bold">all data collected is non-identifiable.</span>
              We don’t care about what specific titles you have in your collection or what you
              watch. We only care about making Shoko better which is what this data will allow us
              to do.
            </div>
            <div className="font-muli mt-4">
              <span className="font-bold">Sentry</span>
              <ul>
                <li>- Error information and context</li>
              </ul>
            </div>
            <div className="font-muli mt-4">
              <span className="font-bold">Google Analytics</span>
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
          </div>
          <div className="flex items-center mt-6">
            <span className="flex mr-6">Allow Shoko To Collect Anonymous Data</span>
            <span className="flex">
              <Checkbox id="collectData" isChecked={collectData} onChange={this.handleInputChange} />
            </span>
          </div>
        </div>
        <Footer prevTabKey="import-folders" nextTabKey="" finish nextDisabled={!collectData} />
      </React.Fragment>
    );
  }
}

export default DataCollection;
