// @flow
import React from 'react';
import { Panel } from 'react-bootstrap';
import store from '../../core/store';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import ImportFolders from '../main/ImportFolders';
import ImportFolderSeries from './ImportFolderSeries';
import { uiVersion } from '../../core/util';

class ImportFoldersPage extends React.Component<{}> {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${uiVersion()}`;

    store.dispatch({ type: Events.PAGE_IMPORT_FOLDERS_LOAD, payload: null });
  }

  render() {
    return (
      <Layout>
        <section className="main-content">
          <section className="wrapper">
            <Overview />
            <div className="row">
              <InfoPanel title="Info Box Example" className="col-sm-12">
                <Panel>
                Import folder management and information about your collection.
                </Panel>
              </InfoPanel>
            </div>
            <div className="row">
              <ImportFolders
                description="Location, Type, Provider and Status"
                className="col-sm-4"
              />
              <ImportFolderSeries className="col-sm-8" />
            </div>
          </section>
        </section>
      </Layout>
    );
  }
}

export default ImportFoldersPage;
