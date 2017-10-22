import 'isomorphic-fetch';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  TabContainer, Row, Col, Nav, NavItem, TabPane, TabContent, Grid,
} from 'react-bootstrap';
import cx from 'classnames';
import s from './styles.css';
import Events from '../../core/events';
import { uiVersion } from '../../core/util';
import TabDatabase from './TabDatabase';
import TabAnidb from './TabAnidb';
import TabUser from './TabUser';
import TabInit from './TabInit';
import AlertContainer from '../../components/AlertContainer';

const UI_VERSION = uiVersion();

class FirstRunPage extends React.Component {
  static propTypes = {
    getDatabaseInfo: PropTypes.func,
    status: PropTypes.object,
  };

  constructor() {
    super();
    this.setActiveTab = this.setActiveTab.bind(this);
    this.state = {
      errorMessage: null,
      activeTab: 'tabDatabase',
    };
  }

  componentDidMount() {
    document.title = `Shoko Server Web UI ${UI_VERSION}`;
    this.props.getDatabaseInfo();
  }

  setActiveTab(key) {
    this.setState({ activeTab: key });
  }

  render() {
    const { activeTab } = this.state;
    const { status } = this.props;
    const isStarted = status.server_started === true;
    return (
      <div className={s.wrapper}>
        <div className={s['wrapper-inner']}>
          <div className="container-fluid">
            <AlertContainer />
            <section className="panel">
              <TabContainer id="first-run" className={cx(s.container)} onSelect={this.setActiveTab} activeKey={activeTab}>
                <Grid>
                  <Row>
                    <Col sm={12}>
                      <Nav bsStyle="pills">
                        <NavItem disabled={isStarted} eventKey="tabDatabase">Database</NavItem>
                        <NavItem disabled={isStarted} eventKey="tabAnidb">AniDB Account</NavItem>
                        <NavItem disabled={isStarted} eventKey="tabUser">Local Account</NavItem>
                        <NavItem eventKey="tabInit">Init</NavItem>
                      </Nav>
                    </Col>
                  </Row>
                  <Row>
                    <TabContent className={cx(s['tab-content'])}>
                      <TabPane eventKey="tabDatabase">
                        <TabDatabase setActiveTab={this.setActiveTab} />
                      </TabPane>
                      <TabPane eventKey="tabAnidb">
                        <TabAnidb setActiveTab={this.setActiveTab} />
                      </TabPane>
                      <TabPane eventKey="tabUser">
                        <TabUser setActiveTab={this.setActiveTab} />
                      </TabPane>
                      <TabPane eventKey="tabInit">
                        <TabInit setActiveTab={this.setActiveTab} />
                      </TabPane>
                    </TabContent>
                  </Row>
                </Grid>
              </TabContainer>
            </section>
          </div>
        </div>
      </div>
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FirstRunPage);
