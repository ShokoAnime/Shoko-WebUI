/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { initialState as SettingsState } from '../../core/slices/serverSettings';
import type { SettingsDatabaseType } from '../../core/types/api/settings';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import Button from '../../components/Buttons/Button';

type State = SettingsDatabaseType;

class DatabaseSetup extends React.Component<Props, State> {
  state = SettingsState.Database;

  componentDidMount = () => {
    const { Database } = this.props;
    this.setState(Database);
  };

  handleInputChange = (event: any) => {
    const { id, value } = event.target;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
  };

  handleTest = (changeTab: boolean) => {
    const { saveSettings, testDatabase } = this.props;
    saveSettings({ context: 'Database', newSettings: this.state, skipValidation: true });
    testDatabase(changeTab);
  };

  renderSqliteOptions = () => {
    const { SQLite_DatabaseFile } = this.state;
    return (
      <Input id="SQLite_DatabaseFile" value={SQLite_DatabaseFile} label="Database File" type="text" placeholder="Database File" onChange={this.handleInputChange} className="py-2 mt-2 w-1/2" />
    );
  };

  renderLegacyDBOptions = () => {
    const {
      Hostname, Schema, Username, Password,
    } = this.state;
    return (
      <div className="flex flex-col w-1/2 mt-2">
        <Input id="Hostname" value={Hostname} label="Hostname" type="text" placeholder="Hostname" onChange={this.handleInputChange} className="py-2" />
        <Input id="Schema" value={Schema} label="Schema Name" type="text" placeholder="Schema Name" onChange={this.handleInputChange} className="py-2" />
        <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="py-2" />
        <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="py-2" />
      </div>
    );
  };

  renderDBOptions = () => {
    const { Type } = this.state;
    switch (Type) {
      case 'SQLite':
        return this.renderSqliteOptions();
      case 'MySQL': case 'SQLServer':
        return this.renderLegacyDBOptions();
      default:
        return this.renderSqliteOptions();
    }
  };

  render() {
    const { SQLite_DatabaseFile, Type } = this.state;
    const { isFetching, status, saved } = this.props;

    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow px-10 pt-10 overflow-y-auto">
          <span className="font-bold text-lg">Setting Up Your Database</span>
          <div className="font-mulish mt-5 text-justify">
            Shoko uses SQLite for your database and will automatically create the database for you.
            If you&apos;d like to select a different location for your database file, you can do
            so by changing the directory below.
          </div>
          <div className="flex flex-col mt-4 overflow-y-auto flex-shrink">
            <span className="font-bold my-2">Database Type</span>
            <div className="flex">
              <Select id="Type" value={Type} onChange={this.handleInputChange}>
                <option value="SQLite">SQLite</option>
                <option value="MySQL">MySQL</option>
                <option value="SQLServer">SQLServer</option>
              </Select>
            </div>
            {this.renderDBOptions()}
            {Type !== 'SQLite' && (
              <div className="flex my-4 items-center">
                <Button onClick={() => this.handleTest(false)} className="bg-color-accent-secondary py-2 px-3 rounded mr-4" disabled={isFetching}>Test</Button>
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
            )}
          </div>
        </div>
        <Footer prevTabKey="acknowledgement" nextDisabled={(Type !== 'SQLite' && !saved) || SQLite_DatabaseFile === ''} saveFunction={() => this.handleTest(true)} isFetching={isFetching} />
      </React.Fragment>
    );
  }
}

const mapState = (state: RootState) => ({
  Database: state.serverSettings.Database,
  status: state.firstrun.databaseStatus,
  isFetching: state.fetching.firstrunDatabase,
  saved: state.firstrun.saved['db-setup'],
});

const mapDispatch = {
  testDatabase: (payload: boolean) => ({ type: Events.FIRSTRUN_TEST_DATABASE, payload }),
  saveSettings: (payload: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload }),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(DatabaseSetup);
