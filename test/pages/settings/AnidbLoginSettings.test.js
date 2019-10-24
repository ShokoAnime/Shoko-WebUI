// @flow
import React from 'react';
import test from 'ava';
import { forEach } from 'lodash';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import Component from '../../../src/pages/settings/AnidbLoginSettings';
import Events from '../../../src/core/events';

configure({ adapter: new Adapter() });

const mockStore = configureStore();
const fields = {
  text: ['Username', 'AVDumpKey', 'ClientPort', 'AVDumpClientPort'],
  password: ['Password'],
};

const data = {};
const changedData = {};
forEach(fields, (names) => {
  forEach(names, (name) => {
    data[name] = `Test${name}`;
    changedData[name] = `Text${name}Change`;
  });
});

const store = mockStore({
  settings: {
    server: {
      AniDb: { ...data },
    },
  },
});

const actionPayload = { context: 'AniDb', original: data, changed: changedData };

test('AnidbLoginSettings', (t) => {
  const wrapper = mount(<Provider store={store}><Component /></Provider>);
  forEach(fields, (names, fieldType) => {
    forEach(names, (f) => {
      const field = wrapper.find(`input.bp3-input[value="${data[f]}"][type="${fieldType}"]`);
      t.is(field.prop('value'), data[f], `renders ${f}`);
      const mockInput = { target: { id: f, value: changedData[f] } };
      field.simulate('change', mockInput);
    });
  });
  wrapper.find('SettingsPanel').prop('onAction').call();
  const actions = store.getActions();
  const expectedPayload = [{ type: Events.SETTINGS_SAVE_SERVER, payload: actionPayload }];
  t.deepEqual(expectedPayload, actions, 'action with changed settings is dispatched');
});
