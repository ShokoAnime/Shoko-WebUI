// @flow
import React from 'react';
import test from 'ava';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import Component from '../../../src/components/Buttons/AutoRefreshSwitch';
import Events from '../../../src/core/events';

configure({ adapter: new Adapter() });
const mockStore = configureStore();

test('autoUpdate true', (t) => {
  const store = mockStore({ autoUpdate: true });
  // FIXME: waiting on https://github.com/facebook/flow/issues/7365 to get back to shallow
  const wrapper = mount(<Provider store={store}><Component /></Provider>);
  t.true(wrapper.render().hasClass('enabled'), 'has .enabled class name');

  const el = wrapper.find('.dropdown-toggle');
  el.simulate('click');

  const actions = store.getActions();
  const expectedPayload = [{ type: Events.STOP_API_POLLING, payload: { type: 'auto-refresh' } }];
  t.deepEqual(expectedPayload, actions, 'click fires STOP_API_POLLING if autoUpdate is on');
});

test('autoUpdate false', (t) => {
  const store = mockStore({ autoUpdate: false });
  const wrapper = mount(<Provider store={store}><Component /></Provider>);
  t.false(wrapper.render().hasClass('enabled'), 'has no .enabled class name');

  const el = wrapper.find('.dropdown-toggle');
  el.simulate('click');

  const actions = store.getActions();
  const expectedPayload = [{ type: Events.START_API_POLLING, payload: { type: 'auto-refresh' } }];
  t.deepEqual(expectedPayload, actions, 'click fires START_API_POLLING if autoUpdate is off');
});
