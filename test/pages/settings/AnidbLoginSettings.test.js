// @flow
import React from 'react';
import test from 'ava';
import { forEach } from 'lodash';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { FormGroup } from '@blueprintjs/core';
import { Provider } from 'react-redux';
import Component from '../../../src/pages/settings/AnidbLoginSettings';
import Events from '../../../src/core/events';

configure({ adapter: new Adapter() });

const mockStore = configureStore();
const fields = ['AniDB_Username', 'AniDB_Password', 'AniDB_AVDumpKey', 'AniDB_ClientPort', 'AniDB_AVDumpClientPort'];
const data = {};
const changedData = {};
forEach(fields, (f) => {
  data[f] = `Test${f}`;
  changedData[f] = `Text${f}Change`;
});

const store = mockStore({
  settings: {
    server: data,
  },
});

test('AnidbLoginSettings', (t) => {
  const wrapper = mount(<Provider store={store}><Component /></Provider>);
  forEach(fields, (f) => {
    const field = wrapper.find(`input.bp3-input[value="${data[f]}"]`);
    t.is(field.prop('value'), data[f], `renders ${f}`);
    const mockInput = { target: { id: f, value: changedData[f] } };
    field.simulate('change', mockInput);
  });
  wrapper.find('SettingsPanel').prop('onAction').call();
  const actions = store.getActions();
  const expectedPayload = [{ type: Events.SETTINGS_SAVE_SERVER, payload: changedData }];
  t.deepEqual(expectedPayload, actions, 'action with changed settings is dispatched');
});
