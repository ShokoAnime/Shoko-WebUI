/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../core/store';
import Events from '../../core/events';
import { unsetSaved as unsetFirstRunSaved, setDatabaseStatus } from '../../core/slices/firstrun';
import Footer from './Footer';
import Input from '../../components/Input/Input';
import Select from '../../components/Input/Select';
import TransitionDiv from '../../components/TransitionDiv';

function DatabaseSetup() {
  const dispatch = useDispatch();

  const dbSettings = useSelector((state: RootState) => state.localSettings.Database);
  const isFetching = useSelector((state: RootState) => state.fetching.firstrunDatabase);
  const status = useSelector((state: RootState) => state.firstrun.databaseStatus);

  const [newDbSettings, setNewDbSettings] = useState({
    MySqliteDirectory: '',
    DatabaseBackupDirectory: '',
    Type: 'SQLite',
    Username: '',
    Password: '',
    Schema: '',
    Hostname: '',
    SQLite_DatabaseFile: '',
  });

  useEffect(() => {
    setNewDbSettings(dbSettings);
  }, []);

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    setNewDbSettings({ ...newDbSettings, [id]: value });
    dispatch(setDatabaseStatus({ type: 'success', text: '' }));
    dispatch(unsetFirstRunSaved('db-setup'));
  };

  const handleTest = () => {
    dispatch(({ type: Events.SETTINGS_SAVE_SERVER, payload: { context: 'Database', newSettings: newDbSettings, skipValidation: true } }));
    dispatch({ type: Events.FIRSTRUN_TEST_DATABASE });
  };

  const renderSqliteOptions = () => (
    <Input id="SQLite_DatabaseFile" value={newDbSettings.SQLite_DatabaseFile} label="Database File" type="text" placeholder="Database File" onChange={handleInputChange} className="mt-6" />
  );

  const renderLegacyDBOptions = () => (
    <div className="flex flex-col">
      <Input id="Hostname" value={newDbSettings.Hostname} label="Hostname" type="text" placeholder="Hostname" onChange={handleInputChange} className="mt-6" />
      <Input id="Schema" value={newDbSettings.Schema} label="Schema Name" type="text" placeholder="Schema Name" onChange={handleInputChange} className="mt-6" />
      <Input id="Username" value={newDbSettings.Username} label="Username" type="text" placeholder="Username" onChange={handleInputChange} className="mt-6" />
      <Input id="Password" value={newDbSettings.Password} label="Password" type="password" placeholder="Password" onChange={handleInputChange} className="mt-6" />
    </div>
  );

  const renderDBOptions = () => {
    switch (newDbSettings.Type) {
      case 'SQLite':
        return renderSqliteOptions();
      case 'MySQL': case 'SQLServer':
        return renderLegacyDBOptions();
      default:
        return renderSqliteOptions();
    }
  };

  return (
    // TODO: Change the UI to the new one. Keeping the old for now.
    <TransitionDiv className="flex flex-col overflow-y-auto justify-center px-96">
      <div className="font-semibold text-lg">Setting Up Your Database</div>
      <div className="font-open-sans font-semibold mt-10 text-justify">
        Shoko uses SQLite for your database and will automatically create the database for you.
        If you&apos;d like to select a different location for your database file, you can do
        so by changing the directory below.
      </div>
      <div className="flex flex-col my-10 overflow-y-auto flex-shrink">
        <Select label="Database Type" id="Type" value={newDbSettings.Type} onChange={handleInputChange} className="w-32">
          <option value="SQLite">SQLite</option>
          <option value="MySQL">MySQL</option>
          <option value="SQLServer">SQLServer</option>
        </Select>
        {renderDBOptions()}
      </div>
      <Footer
        nextDisabled={
          (newDbSettings.Type !== 'SQLite' && (newDbSettings.Hostname === '' || newDbSettings.Schema === '' || newDbSettings.Username === '')) || newDbSettings.SQLite_DatabaseFile === ''
        }
        saveFunction={() => handleTest()}
        isFetching={isFetching}
        status={status}
      />
    </TransitionDiv>
  );
}

export default DatabaseSetup;
