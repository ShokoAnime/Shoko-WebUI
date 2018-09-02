// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Columns, Container, Section } from 'react-bulma-components';
import store from '../../core/store';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import Overview from './Overview';
import Commands from './Commands';
import RecentFiles from './RecentFiles';
import News from './News';
import ImportFolders from './ImportFolders';
import QuickActions from './QuickActions';
import { uiVersion } from '../../core/util';
import type { State } from '../../core/store';

type Props = {
  autoUpdate: boolean,
  stopPolling: () => void,
}

class MainPage extends React.Component<Props> {
  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.title = `Shoko Server Web UI ${uiVersion()}`;

    store.dispatch({ type: Events.DASHBOARD_LOAD, payload: null });
  }

  componentWillUnmount() {
    const { autoUpdate, stopPolling } = this.props;
    if (autoUpdate) {
      stopPolling();
    }
  }

  render() {
    return (
      <Layout>
        <Section>
          <Overview />
          <Columns>
            <Columns.Column>
              <Commands className="col-sm-4 fa-icon-20" />
            </Columns.Column>
            <Columns.Column>
              <RecentFiles className="col-sm-8" />
            </Columns.Column>
          </Columns>
          <Columns>
            <Columns.Column>
              <News className="col-sm-4" />
            </Columns.Column>
            <Columns.Column>
              <QuickActions className="col-sm-4" />
            </Columns.Column>
            <Columns.Column>
              <ImportFolders className="col-sm-4" />
            </Columns.Column>
          </Columns>
        </Section>
      </Layout>
    );
  }
}

function mapStateToProps(state: State) {
  const { autoUpdate } = state;

  return {
    autoUpdate,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stopPolling: () => dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'auto-refresh' } }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
