/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { getDatabase } from '../../core/actions/firstrun';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import Button from '../../components/Buttons/Button';

class DatabaseSetup extends React.Component<Props> {
  componentDidMount() {
    const { getDatabaseFunc } = this.props;
    getDatabaseFunc();
  }

  handleInputChange = (event: any) => {
    const { changeSetting } = this.props;
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    changeSetting(name, value);
  };

  renderSqliteOptions = () => {
    const { sqlite_databasefile } = this.props;
    return (
      <Input id="sqlite_databasefile" value={sqlite_databasefile} label="Database File" type="text" placeholder="Database File" onChange={this.handleInputChange} className="py-2 mt-2 w-1/2" />
    );
  };

  renderMysqlOptions = () => {
    const {
      mysql_hostname, mysql_schemaname, mysql_username, mysql_password,
    } = this.props;
    return (
      <div className="flex flex-col w-1/2 mt-2">
        <Input id="mysql_hostname" value={mysql_hostname} label="Hostname" type="text" placeholder="Hostname" onChange={this.handleInputChange} className="py-2" />
        <Input id="mysql_schemaname" value={mysql_schemaname} label="Schema Name" type="text" placeholder="Schema Name" onChange={this.handleInputChange} className="py-2" />
        <Input id="mysql_username" value={mysql_username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
        <Input id="mysql_password" value={mysql_password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
      </div>
    );
  };

  renderSqlServerOptions = () => {
    const {
      sqlserver_databaseserver, sqlserver_databasename,
      sqlserver_username, sqlserver_password,
    } = this.props;
    return (
      <div className="flex flex-col w-1/2 mt-2">
        <Input id="sqlserver_databaseserver" value={sqlserver_databaseserver} label="Hostname" type="text" placeholder="Hostname" onChange={this.handleInputChange} className="py-2" />
        <Input id="sqlserver_databasename" value={sqlserver_databasename} label="Database" type="text" placeholder="Database" onChange={this.handleInputChange} className="py-2" />
        <Input id="sqlserver_username" value={sqlserver_username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
        <Input id="sqlserver_password" value={sqlserver_password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
      </div>
    );
  };

  renderDBOptions = () => {
    const { db_type } = this.props;
    switch (db_type) {
      case 'SQLite':
        return this.renderSqliteOptions();
      case 'MySQL':
        return this.renderMysqlOptions();
      case 'SQLServer':
        return this.renderSqlServerOptions();
      default:
        return this.renderSqliteOptions();
    }
  };

  render() {
    const {
      db_type, isFetching, status, testDatabase,
    } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow px-10 pt-10 overflow-y-auto">
          <span className="font-bold text-lg">Setting Up Your Database</span>
          <div className="font-muli mt-5">
            Shoko uses SQLite for your database and will automatically create the database for you.
            If you&apos;d like to select a different location for your database file, you can do
            so by changing the directory below.
          </div>
          <div className="flex flex-col mt-4 overflow-y-auto flex-shrink">
            <span className="font-bold my-2">Database Type</span>
            <Select id="db_type" value={db_type} className="relative w-1/5" onChange={this.handleInputChange}>
              <option value="SQLite">SQLite</option>
              <option value="MySQL">MySQL</option>
              <option value="SQLServer">SQLServer</option>
            </Select>
            {this.renderDBOptions()}
            <div className="flex my-4 items-center">
              <Button onClick={() => testDatabase()} className="bg-color-accent-secondary py-2 px-3 rounded mr-4">Test</Button>
              {isFetching ? (
                <div>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Testing...
                </div>
              ) : (
                <div className={cx(['flex ', status.type === 'error' ? 'color-danger' : 'color-accent'])}>
                  {status.text}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer prevTabKey="tab-acknowledgement" nextTabKey="tab-local-account" />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  ...(state.firstrun.database),
  isFetching: state.fetching.firstrunDatabase,
});

const mapDispatch = {
  changeSetting: (field: string, value: string) => (getDatabase({ [field]: value })),
  testDatabase: () => ({ type: Events.FIRSTRUN_TEST_DATABASE }),
  getDatabaseFunc: () => ({ type: Events.FIRSTRUN_GET_DATABASE }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(DatabaseSetup);
