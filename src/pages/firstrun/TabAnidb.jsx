// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Alert, Button, ButtonToolbar, Col, Form, FormGroup } from 'react-bootstrap';
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
  getAnidb: () => void,
  isFetching: boolean,
}

class TabAnidb extends React.Component<Props> {
  static propTypes = {
    anidb: PropTypes.object,
    changeSetting: PropTypes.func,
    saveAnidb: PropTypes.func,
    testAnidb: PropTypes.func,
    getAnidb: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  componentDidMount() {
    this.props.getAnidb();
  }

  render() {
    const {
      anidb, changeSetting, saveAnidb, testAnidb, isFetching,
    } = this.props;

    return (
      <Form horizontal>
        {isFetching && <Alert onDismiss={() => {}} bsStyle="warning"><i className="fa fa-refresh fa-spin" />Loading...</Alert>}
        {!isFetching && anidb.status.text && <Alert onDismiss={() => {}} bsStyle={anidb.status.type === 'error' ? 'danger' : 'success'}>{anidb.status.text}</Alert>}
        <FieldGroup id="formAnidbUsername" label="Username:" data={anidb} field="login" onChange={changeSetting} isHidden={false} />
        <FieldGroup id="formAnidbPassword" label="Password:" data={anidb} field="password" onChange={changeSetting} isHidden={false} />
        <FormGroup>
          <Col smOffset={2} sm={6}>
            <ButtonToolbar>
              <Button className="pull-right" bsStyle="primary" onClick={saveAnidb}>Save</Button>
              <Button className="pull-right" bsStyle="info" onClick={testAnidb}>Test</Button>
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
    isFetching: fetching.firstrunAnidb === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeSetting: (field, value) => { dispatch(getAnidb({ [field]: value })); },
    saveAnidb: () => { dispatch({ type: Events.FIRSTRUN_SET_ANIDB }); },
    testAnidb: () => { dispatch({ type: Events.FIRSTRUN_TEST_ANIDB }); },
    getAnidb: () => { dispatch({ type: Events.FIRSTRUN_GET_ANIDB }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabAnidb);
