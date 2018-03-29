// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, ButtonToolbar, Col, Form, FormGroup } from 'react-bootstrap';
import { getUser } from '../../core/actions/firstrun';
import Events from '../../core/events';
import FieldGroup from './FieldGroup';

type Props = {
  user: {
    status: {
      text: string,
      type: string,
    }
  },
  changeSetting: () => void,
  saveUser: () => void,
  getUser: () => void,
  isFetching: boolean,
}

class TabUser extends React.Component<Props> {
  static propTypes = {
    user: PropTypes.object,
    changeSetting: PropTypes.func,
    saveUser: PropTypes.func,
    getUser: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  componentDidMount() {
    this.props.getUser();
  }

  render() {
    const {
      user, changeSetting, saveUser, isFetching,
    } = this.props;

    return (
      <Form horizontal>
        {isFetching && <Alert onDismiss={() => {}} bsStyle="warning"><i className="fa fa-refresh fa-spin" />Loading...</Alert>}
        {!isFetching && user.status.text && <Alert onDismiss={() => {}} bsStyle={user.status.type === 'error' ? 'danger' : 'success'}>{user.status.text}</Alert>}
        <FieldGroup id="formUsername" label="Username:" data={user} field="login" onChange={changeSetting} isHidden={false} />
        <FieldGroup id="formPassword" label="Password:" data={user} field="password" onChange={changeSetting} isHidden={false} />
        <FormGroup>
          <Col smOffset={2} sm={6}>
            <ButtonToolbar>
              <Button className="pull-right" bsStyle="primary" onClick={saveUser}>Save</Button>
            </ButtonToolbar>
          </Col>
        </FormGroup>
      </Form>
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
    getUser: () => { dispatch({ type: Events.FIRSTRUN_GET_USER }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabUser);
