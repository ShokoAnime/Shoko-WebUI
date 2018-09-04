// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Columns, Section } from 'react-bulma-components';
import Events from '../../core/events';
import Layout from '../../components/Layout/Layout';
import Overview from './Overview';
import Commands from './Commands';
import RecentFiles from './RecentFiles';
import News from './News';
import ImportFolders from './ImportFolders';
import QuickActions from './QuickActions';
import type { State } from '../../core/store';

type Props = {
  autoUpdate: boolean,
  stopPolling: () => void,
  load: () => void,
}

class MainPage extends React.Component<Props> {
  componentDidMount() {
    const { load } = this.props;
    load();
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
        <Section className="dashboard">
          <Overview />
          <Columns>
            <Columns.Column size={3}>
              <Commands />
            </Columns.Column>
            <Columns.Column>
              <RecentFiles />
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
    load: () => dispatch({ type: Events.DASHBOARD_LOAD, payload: null }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);
