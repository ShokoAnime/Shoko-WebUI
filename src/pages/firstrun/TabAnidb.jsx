// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Button, Callout, ControlGroup,
} from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { getAnidb } from '../../core/actions/firstrun';
import Events from '../../core/events';
import FieldGroup from '../../components/FieldGroup';

type Props = {
  anidb: {
    status: {
      text: string,
      type: string,
    }
  },
  changeSetting: () => void,
  saveAnidb: () => void,
  testAnidb: () => void,
  getAnidbFunc: () => void,
  isFetching: boolean,
}

class TabAnidb extends React.Component<Props> {
  static propTypes = {
    anidb: PropTypes.object,
    changeSetting: PropTypes.func,
    saveAnidb: PropTypes.func,
    testAnidb: PropTypes.func,
    getAnidbFunc: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  componentDidMount() {
    const { getAnidbFunc } = this.props;
    getAnidbFunc();
  }

  render() {
    const {
      anidb, changeSetting, saveAnidb, testAnidb, isFetching,
    } = this.props;

    return (
      <React.Fragment>
        {isFetching && <Callout intent="warning"><FontAwesomeIcon icon={faSpinner} spin />Loading...</Callout>}
        {!isFetching && anidb.status.text && <Callout intent={anidb.status.type === 'error' ? 'danger' : 'success'}>{anidb.status.text}</Callout>}
        <FieldGroup id="formAnidbUsername" label="Username:" data={anidb} field="login" onChange={changeSetting} isHidden={false} />
        <FieldGroup id="formAnidbPassword" label="Password:" data={anidb} field="password" onChange={changeSetting} isHidden={false} />
        <ControlGroup>
          <Button className="pull-right" intent="info" onClick={testAnidb}>Test</Button>
          <Button className="pull-right" intent="primary" onClick={saveAnidb}>Save</Button>
        </ControlGroup>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { firstrun, fetching } = state;

  return {
    isFetching: fetching.firstrunAnidb === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeSetting: (field, value) => { dispatch(getAnidb({ [field]: value })); },
    saveAnidb: () => { dispatch({ type: Events.FIRSTRUN_SET_ANIDB }); },
    testAnidb: () => { dispatch({ type: Events.FIRSTRUN_TEST_ANIDB }); },
    getAnidbFunc: () => { dispatch({ type: Events.FIRSTRUN_GET_ANIDB }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabAnidb);
