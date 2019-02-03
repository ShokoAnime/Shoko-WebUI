// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
  Button, Callout,
} from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { getUser } from '../../core/actions/firstrun';
import Events from '../../core/events';
import FieldGroup from '../../components/FieldGroup';

type Props = {
  user: {
    status: {
      text: string,
      type: string,
    }
  },
  changeSetting: () => void,
  saveUser: () => void,
  getUserFunc: () => void,
  isFetching: boolean,
}

class TabUser extends React.Component<Props> {
  static propTypes = {
    user: PropTypes.object,
    changeSetting: PropTypes.func,
    saveUser: PropTypes.func,
    getUserFunc: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  componentDidMount() {
    const { getUserFunc } = this.props;
    getUserFunc();
  }

  render() {
    const {
      user, changeSetting, saveUser, isFetching,
    } = this.props;

    return (
      <React.Fragment>
        {isFetching && <Callout intent="warning"><FontAwesomeIcon icon={faSpinner} spin />Loading...</Callout>}
        {!isFetching && user.status.text && <Callout intent={user.status.type === 'error' ? 'danger' : 'success'}>{user.status.text}</Callout>}
        <FieldGroup id="formUsername" label="Username:" data={user} field="login" onChange={changeSetting} isHidden={false} />
        <FieldGroup id="formPassword" label="Password:" data={user} field="password" onChange={changeSetting} isHidden={false} />
        <Button intent="primary" onClick={saveUser}>Save</Button>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { firstrun, fetching } = state;

  return {
    isFetching: fetching.firstrunUser === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeSetting: (field, value) => { dispatch(getUser({ [field]: value })); },
    saveUser: () => { dispatch({ type: Events.FIRSTRUN_SET_USER }); },
    getUserFunc: () => { dispatch({ type: Events.FIRSTRUN_GET_USER }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabUser);
