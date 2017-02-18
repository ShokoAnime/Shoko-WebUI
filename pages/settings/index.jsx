import React from 'react';
import { Panel } from 'react-bootstrap';
import history from '../../core/history';
import store from '../../core/store';
import { getLog } from '../../core/actions/settings/Log';
import { getSettings } from '../../core/actions/settings/Api';
import Layout from '../../components/Layout/Layout';
import InfoPanel from '../../components/Panels/InfoPanel';
import Overview from '../main/Overview';
import StyleSettings from './StyleSettings';
import LogOptions from './LogOptions';
import OtherSettings from './OtherSettings';

class SettingsPage extends React.Component {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${__VERSION__}`;

    const state = store.getState();
    if (state.apiSession.apikey === '') {
      history.push({
        pathname: '/',
      });
      return;
    }

    getLog().then(() => { store.dispatch(getSettings()); });
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
              <StyleSettings className="col-sm-4" />
              <LogOptions className="col-sm-4" />
              <OtherSettings className="col-sm-4" />
            </div>
          </section>
        </section>
      </Layout>
    );
  }
}

export default SettingsPage;
