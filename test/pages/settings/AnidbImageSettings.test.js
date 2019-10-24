// @flow
import React from 'react';
import test from 'ava';
import { forEach } from 'lodash';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import Component from '../../../src/pages/settings/AnidbImageSettings';
import Events from '../../../src/core/events';

configure({ adapter: new Adapter() });

const mockStore = configureStore();
const fields = {
  SettingsYesNoToggle: ['DownloadCharacters', 'DownloadCreators', 'DownloadRelatedAnime'],
  SettingsSlider: ['MaxRelationDepth'],
};
const defaults = {
  SettingsYesNoToggle: [true, false],
  SettingsSlider: [0, 1],
};
const data = {};
const changedData = {};
forEach(fields, (names, fieldType) => {
  forEach(names, (name) => {
    [data[name], changedData[name]] = defaults[fieldType];
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

test('AnidbImageSettings', (t) => {
  const wrapper = mount(<Provider store={store}><Component /></Provider>);
  forEach(fields, (names, fieldType) => {
    forEach(names, (name) => {
      const field = wrapper.find(`${fieldType}[name="${name}"]`);
      field.prop('onChange').call(this, name, changedData[name]);
    });
  });
  wrapper.find('SettingsPanel').prop('onAction').call();
  const actions = store.getActions();
  const expectedPayload = [{ type: Events.SETTINGS_SAVE_SERVER, payload: actionPayload }];
  t.deepEqual(expectedPayload, actions, 'action with changed settings is dispatched');
});
