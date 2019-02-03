// @flow
import React from 'react';
import test from 'ava';
import { forEach } from 'lodash';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import Component from '../../../src/pages/settings/AnidbImageSettings';
import Events from '../../../src/core/events';

configure({ adapter: new Adapter() });

const mockStore = configureStore();
const fields = ['AniDB_DownloadCharacters', 'AniDB_DownloadCreators', 'AniDB_DownloadReviews', 'AniDB_DownloadReleaseGroups'];
const data = {};
const changedData = {};
forEach(fields, (f) => {
  data[f] = 'True';
  changedData[f] = 'False';
});

const store = mockStore({
  settings: {
    server: data,
  },
});

test('AnidbImageSettings', (t) => {
  const wrapper = shallow(<Component store={store} />).dive();
  forEach(fields, (f) => {
    const field = wrapper.find(`SettingsYesNoToggle[name="${f}"]`);
    t.is(field.prop('value'), data[f], `renders ${f}`);
    field.simulate('change', f, changedData[f]);
  });
  wrapper.find('SettingsPanel').prop('onAction').call();
  const actions = store.getActions();
  const expectedPayload = [{ type: Events.SETTINGS_SAVE_SERVER, payload: changedData }];
  t.deepEqual(expectedPayload, actions, 'action with changed settings is dispatched');
});
