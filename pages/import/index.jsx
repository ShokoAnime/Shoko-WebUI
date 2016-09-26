import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import ImportFolders from '../main/ImportFolders';
import ImportFolderSeries from './ImportFolderSeries';

class ImportFoldersPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `JMM Server Web UI ${__VERSION__}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
      return;
    }
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
                Very long text explaining what to with this page. Very long text explaining
                what to with this page. Very long text explaining what to with this page. Very
                long text explaining what to with this page. Very long text explaining what to
                with this page. Very long text explaining what to with this page. Very long text
                explaining what to with this page. Very long text explaining what to with this page.
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
