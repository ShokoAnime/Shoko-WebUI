// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import {
  Alert, Button, ButtonToolbar, Col, Form, FormGroup, Panel,
} from 'react-bootstrap';
import Events from '../../core/events';
import s from './styles.css';
import Link from '../../components/Link/Link';

type Props = {
  status: {
    startup_state: string,
    server_started: boolean,
  },
  saveDatabase: () => void,
  stopPolling: () => void,
  isFetching: boolean,
  setActiveTab: (string) => void
}

type State = {
  useStatus: boolean,
}

class TabInit extends React.Component<Props, State> {
  static propTypes = {
    status: PropTypes.object,
    saveDatabase: PropTypes.func,
    stopPolling: PropTypes.func,
    isFetching: PropTypes.bool,
    setActiveTab: PropTypes.func.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      useStatus: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { stopPolling, setActiveTab, status } = this.props;
    if (nextProps.status.server_started !== status.server_started
      && nextProps.status.server_started === true) {
      stopPolling();
      this.setState({ useStatus: true }, () => { setActiveTab('tabInit'); });
    }
  }

  saveDatabase = () => {
    const { saveDatabase } = this.props;
    this.setState({ useStatus: true }, saveDatabase);
  };

  renderInit() {
    const { isFetching, status } = this.props;
    const { useStatus } = this.state;
    const isLocked = isFetching === true || status.server_started === true;

    return (
      <Form horizontal>
        {useStatus && <Alert onDismiss={() => {}} bsStyle="success"><i className={cx(['fa', 'fa-refresh', 'fa-spin', s['alert-icon']])} />{status.startup_state}</Alert>}
        <Panel>
          On this page you can try and start the server, startup progress will be reported above
          this message, after the startup and database creation process is complete you will be
          able to login.
        </Panel>
        <FormGroup>
          <Col smOffset={2} sm={6}>
            <ButtonToolbar>
              <Button disabled={isLocked} bsStyle="primary" onClick={this.saveDatabase}>Start Server</Button>
            </ButtonToolbar>
          </Col>
        </FormGroup>
      </Form>
    );
  }

  render() {
    const { status } = this.props;
    const isStarted = status.server_started === true;

    return (
      <div>
        {isStarted && <p>Server init was successful, you can go to <Link to="/">login screen</Link> or configure some additional settings.</p>}
        {!isStarted && this.renderInit()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { firstrun, fetching } = state;

  return {
    isFetching: fetching.firstrunInit === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveDatabase: () => { dispatch({ type: Events.FIRSTRUN_INIT_DATABASE }); },
    stopPolling: () => {
      dispatch({ type: Events.STOP_API_POLLING, payload: { type: 'server-status' } });
      dispatch({ type: Events.STOP_FETCHING, payload: 'firstrunDatabase' });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabInit);
