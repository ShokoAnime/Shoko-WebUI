/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  setSaved as setFirstRunSaved,
  TestStatusType,
  unsetSaved as unsetFirstRunSaved,
} from '@/core/slices/firstrun';
import Footer from './Footer';
import Input from '@/components/Input/Input';
import TransitionDiv from '@/components/TransitionDiv';

import { useFirstRunSettingsContext } from './FirstRunPage';
import { useGetInitDatabaseTestMutation } from '@/core/rtkQuery/splitV3Api/initApi';

function DatabaseSetup() {
  const {
    newSettings, saveSettings, updateSetting,
  } = useFirstRunSettingsContext();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [testDatabase, testDatabaseResult] = useGetInitDatabaseTestMutation();
  const [databaseStatus, setDatabaseStatus] = useState<TestStatusType>({ type: 'success', text: '' });

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    updateSetting('Database', id, value);
    setDatabaseStatus({ type: 'success', text: '' });
    dispatch(unsetFirstRunSaved('db-setup'));
  };

  const handleTest = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    await saveSettings();

    testDatabase().unwrap().then(() => {
      setDatabaseStatus({ type: 'success', text: 'Database test successful!' });
      dispatch(setFirstRunSaved('db-setup'));
      navigate('../local-account');
    }, (error) => {
      console.error(error);
      setDatabaseStatus({ type: 'error', text: error.data });
    });
  };

  const {
    SQLite_DatabaseFile,
    Hostname, Schema, Type,
    Username, Password,
  } = newSettings.Database;

  // const renderSqliteOptions = () => (
  //   <Input id="SQLite_DatabaseFile" value={SQLite_DatabaseFile} label="Database File" type="text" placeholder="Database File" onChange={handleInputChange} className="mt-6" />
  // );
  //
  // const renderLegacyDBOptions = () => (
  //   <div className="flex flex-col">
  //     <Input id="Hostname" value={Hostname} label="Hostname" type="text" placeholder="Hostname" onChange={handleInputChange} className="mt-6" />
  //     <Input id="Schema" value={Schema} label="Schema Name" type="text" placeholder="Schema Name" onChange={handleInputChange} className="mt-6" />
  //     <Input id="Username" value={Username} label="Username" type="text" placeholder="Username" onChange={handleInputChange} className="mt-6" />
  //     <Input id="Password" value={Password} label="Password" type="password" placeholder="Password" onChange={handleInputChange} className="mt-6" />
  //   </div>
  // );

  // const renderDBOptions = () => {
  //   switch (Type) {
  //     case 'SQLite':
  //       return renderSqliteOptions();
  //     case 'MySQL': case 'SQLServer':
  //       return renderLegacyDBOptions();
  //     default:
  //       return renderSqliteOptions();
  //   }
  // };

  return (
    <TransitionDiv className="flex flex-col overflow-y-auto justify-center max-w-[38rem] gap-y-8">
      <div className="font-semibold text-xl">Database Setup</div>
      <div className="text-justify">
        Shoko utilizes SQLite as its database system and automatically generates the database upon installation.
        However, if you wish to choose a different location to store your database file, you can do so by modifying the
        directory as illustrated below.
      </div>
      <div className="text-justify">
        By default, Shoko automatically populates the database location. However, you can change it by clicking on the
        folder icon located below.
      </div>
      <div className="text-justify">
        If you already have a pre-existing database, you can choose the first option below to bypass this step. In
        contrast, if you are using a legacy database, you can opt for the second option to input the necessary
        additional information.
      </div>
      <form onSubmit={handleTest}>
        <Input id="SQLite_DatabaseFile" value={SQLite_DatabaseFile} label="Database File" type="text" placeholder="Database File" onChange={handleInputChange} />
        <input type="submit" hidden />
      </form>
      {/*<form className="flex flex-col my-9 overflow-y-auto flex-shrink" onSubmit={handleTest}>*/}
      {/*  <Select label="Database Type" id="Type" value={Type} onChange={handleInputChange} className="w-32">*/}
      {/*    <option value="SQLite">SQLite</option>*/}
      {/*    <option value="MySQL">MySQL</option>*/}
      {/*    <option value="SQLServer">SQLServer</option>*/}
      {/*  </Select>*/}
      {/*  {renderDBOptions()}*/}
      {/*  <input type="submit" hidden />*/}
      {/*</form>*/}
      <Footer
        nextDisabled={
          (Type !== 'SQLite' && (Hostname === '' || Schema === '' || Username === '')) || SQLite_DatabaseFile === ''
        }
        saveFunction={handleTest}
        isFetching={testDatabaseResult.isLoading}
        status={databaseStatus}
      />
    </TransitionDiv>
  );
}

export default DatabaseSetup;
