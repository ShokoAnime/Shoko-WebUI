// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Container, Hero } from 'react-bulma-components';
import { Card, Tab, Tabs } from '@blueprintjs/core';
import Events from '../../core/events';
import TabDatabase from './TabDatabase';
import TabAnidb from './TabAnidb';
import TabUser from './TabUser';
import TabInit from './TabInit';
import AlertContainer from '../../components/AlertContainer';
import { activeTab as activeTabAction } from '../../core/actions/firstrun';

type Props = {
  getDatabaseInfo: () => void,
  setActiveTab: (string) => void,
  activeTab: string,
  status: {
    server_started: boolean,
  },
}

class FirstRunPage extends React.Component<Props> {
  static propTypes = {
    getDatabaseInfo: PropTypes.func,
    setActiveTab: PropTypes.func,
    status: PropTypes.object,
    activeTab: PropTypes.string,
  };

  componentDidMount() {
    const { getDatabaseInfo } = this.props;
    getDatabaseInfo();
  }

  handleTabChange = (key) => {
    const { setActiveTab } = this.props;
    setActiveTab(key);
  };

  render() {
    const { activeTab, status } = this.props;
    const isStarted = status.server_started === true;
    return (
      <Hero size="fullheight" className="firstrun-page">
        <Hero.Body>
          <AlertContainer />
          <Container textAlignment="centered">
            <Card className="firstrun-form">
              <Tabs id="first-run" onChange={this.handleTabChange} selectedTabId={activeTab}>
                <Tab id="tabDatabase" disabled={isStarted} title="Database" panel={<TabDatabase />} />
                <Tab id="tabAnidb" disabled={isStarted} title="AniDB Account" panel={<TabAnidb />} />
                <Tab id="tabUser" disabled={isStarted} title="Local Account" panel={<TabUser />} />
                <Tab id="tabInit" title="Init" panel={<TabInit />} />
              </Tabs>
            </Card>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }
}

function mapStateToProps(state) {
  const { firstrun } = state;

  return {
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getDatabaseInfo: () => {
      dispatch({ type: Events.INIT_STATUS });
      dispatch({ type: Events.FIRSTRUN_GET_DATABASE });
    },
    setActiveTab: value => dispatch(activeTabAction(value)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FirstRunPage);
