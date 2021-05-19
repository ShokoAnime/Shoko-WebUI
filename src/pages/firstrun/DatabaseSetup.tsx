/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { unsetSaved as unsetFirstRunSaved, setDatabaseStatus } from '../../core/slices/firstrun';
import { initialState as SettingsState } from '../../core/slices/serverSettings';
import type { SettingsDatabaseType } from '../../core/types/api/settings';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import TransitionDiv from '../../components/TransitionDiv';

type State = SettingsDatabaseType;

class DatabaseSetup extends React.Component<Props, State> {
  state = SettingsState.Database;

  componentDidMount = () => {
    const { Database, resetStatus } = this.props;
    this.setState(Database);
    resetStatus();
  };

  handleInputChange = (event: any) => {
    const { saved, resetStatus, unsetSaved } = this.props;
    const { id, value } = event.target;
    this.setState(prevState => Object.assign({}, prevState, { [id]: value }));
    resetStatus();
    if (saved) unsetSaved();
  };

  handleTest = () => {
    const { saveSettings, testDatabase } = this.props;
    saveSettings({ context: 'Database', newSettings: this.state, skipValidation: true });
    testDatabase();
  };

  renderSqliteOptions = () => {
    const { SQLite_DatabaseFile } = this.state;
    return (
      <Input id="SQLite_DatabaseFile" value={SQLite_DatabaseFile} label="Database File" type="text" placeholder="Database File" onChange={this.handleInputChange} className="mt-6" />
    );
  };

  renderLegacyDBOptions = () => {
    const {
      Hostname, Schema, Username, Password,
    } = this.state;
    return (
      <div className="flex flex-col">
        <Input id="Hostname" value={Hostname} label="Hostname" type="text" placeholder="Hostname" onChange={this.handleInputChange} className="mt-6" />
        <Input id="Schema" value={Schema} label="Schema Name" type="text" placeholder="Schema Name" onChange={this.handleInputChange} className="mt-6" />
        <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={this.handleInputChange} className="mt-6" />
        <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={this.handleInputChange} className="mt-6" />
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
    const {
      SQLite_DatabaseFile, Type,
      Hostname, Schema, Username,
    } = this.state;
    const { isFetching, status } = this.props;

    return (
      <TransitionDiv className="flex flex-col flex-grow overflow-y-auto justify-center">
        <span className="font-bold text-lg">Setting Up Your Database</span>
        <div className="font-mulish mt-5 text-justify">
          Shoko uses SQLite for your database and will automatically create the database for you.
          If you&apos;d like to select a different location for your database file, you can do
          so by changing the directory below.
        </div>
        <div className="flex flex-col my-8 overflow-y-auto flex-shrink">
          <div className="font-bold mb-4 text-lg">Database Type</div>
          <div className="flex">
            <Select id="Type" value={Type} onChange={this.handleInputChange} className="w-full">
              <option value="SQLite">SQLite</option>
              <option value="MySQL">MySQL</option>
              <option value="SQLServer">SQLServer</option>
            </Select>
          </div>
          {this.renderDBOptions()}
        </div>
        <Footer
          nextDisabled={(Type !== 'SQLite' && (Hostname === '' || Schema === '' || Username === '')) || SQLite_DatabaseFile === ''}
          saveFunction={() => this.handleTest()}
          isFetching={isFetching}
          status={status}
        />
      </TransitionDiv>
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
  testDatabase: () => ({ type: Events.FIRSTRUN_TEST_DATABASE }),
  saveSettings: (payload: any) => ({ type: Events.SETTINGS_SAVE_SERVER, payload }),
  resetStatus: () => (setDatabaseStatus({ type: 'success', text: '' })),
  unsetSaved: () => (unsetFirstRunSaved('db-setup')),
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(DatabaseSetup);
