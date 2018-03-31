// @flow
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Alert, Button, ButtonToolbar, Col, ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import { getDatabase } from '../../core/actions/firstrun';
import Events from '../../core/events';
import FieldGroup from '../../components/FieldGroup';
import s from './styles.css';
import SqlCombo from './SqlCombo';

type Props = {
  database: {
    db_type: 'SQLite' | 'MySQL' | 'SQLServer',
    status: {
      text: string,
      type: string,
    }
  },
  status: {
    server_started: boolean,
  },
  changeSetting: (string, string) => void,
  testDatabase: () => void,
  isFetching: boolean,
}

class TabDatabase extends React.Component<Props> {
  static propTypes = {
    database: PropTypes.object,
    status: PropTypes.object,
    changeSetting: PropTypes.func,
    testDatabase: PropTypes.func,
    isFetching: PropTypes.bool,
  };

  render() {
    const {
      database, changeSetting, isFetching, status, testDatabase,
    } = this.props;
    const db = {
      isSQLite: database.db_type === 'SQLite',
      isMySQL: database.db_type === 'MySQL',
      isSQLServer: database.db_type === 'SQLServer',
    };
    const isLocked = isFetching === true || status.server_started === true;

    return (
      <Form horizontal>
        {isFetching && <Alert onDismiss={() => {}} bsStyle="warning"><i className={cx(['fa', 'fa-refresh', 'fa-spin', s['alert-icon']])} />Loading...</Alert>}
        {!isFetching && database.status.text && <Alert onDismiss={() => {}} bsStyle={database.status.type === 'error' ? 'danger' : 'success'}>{database.status.text}</Alert>}
        <FormGroup controlId="formDatabaseType">
          <Col sm={2}>
            <ControlLabel>Database type:</ControlLabel>
          </Col>
          <Col sm={6}>
            <FormControl componentClass="select" placeholder="Database" value={database.db_type} onChange={event => changeSetting('db_type', event.target.value)}>
              <option value="" />
              <option value="SQLite">SQLite</option>
              <option value="MySQL">MySQL</option>
              <option value="SQLServer">SQLServer</option>
            </FormControl>
          </Col>
        </FormGroup>
        <FieldGroup id="formSQLiteDatabaseFile" label="Database file (optional):" data={database} field="sqlite_databasefile" onChange={changeSetting} isHidden={!db.isSQLite} />
        <FieldGroup id="formMySqlHostname" label="Hostname:" data={database} field="mysql_hostname" onChange={changeSetting} isHidden={!db.isMySQL} />
        <FieldGroup id="formMySqlSchema" label="Schema name:" data={database} field="mysql_schemaname" onChange={changeSetting} isHidden={!db.isMySQL} />
        <FieldGroup id="formMySqlUsername" label="Username:" data={database} field="mysql_username" onChange={changeSetting} isHidden={!db.isMySQL} />
        <FieldGroup id="formMySqlPassword" label="Password:" data={database} field="mysql_password" onChange={changeSetting} isHidden={!db.isMySQL} />
        <SqlCombo id="formSQLSeverHostname" label="Hostname:" data={database} field="sqlserver_databaseserver" onChange={changeSetting} isHidden={!db.isSQLServer} />
        <FieldGroup id="formSQLSeverDatabase" label="Database:" data={database} field="sqlserver_databasename" onChange={changeSetting} isHidden={!db.isSQLServer} />
        <FieldGroup id="formSQLSeverUsername" label="Username:" data={database} field="sqlserver_username" onChange={changeSetting} isHidden={!db.isSQLServer} />
        <FieldGroup id="formSQLSeverUsername" label="Password:" data={database} field="sqlserver_password" onChange={changeSetting} isHidden={!db.isSQLServer} />
        <FormGroup>
          <Col smOffset={2} sm={6}>
            <ButtonToolbar>
              <Button className="pull-right" disabled={isLocked} bsStyle="primary" onClick={testDatabase}>Test</Button>
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
    isFetching: fetching.firstrunDatabase === true,
    ...firstrun,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeSetting: (field, value) => { dispatch(getDatabase({ [field]: value })); },
    testDatabase: () => { dispatch({ type: Events.FIRSTRUN_TEST_DATABASE }); },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabDatabase);
