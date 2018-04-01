// @flow
import React from 'react';
import test from 'ava';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moment from 'moment';
import Component from '../../../src/components/Panels/TimeUpdated';

configure({ adapter: new Adapter() });

test('no timestamp, isFetching false', (t) => {
  const component = (
    <Component isFetching={false} className="Test" />
  );
  const wrapper = shallow(component);
  t.true(wrapper.hasClass('Test'), 'has classname');
  t.true(wrapper.find('i.fa').length === 0, 'no loader icon');
  t.true(wrapper.contains('--'), 'no date');
});

test('timestamp, isFetching true', (t) => {
  const timestamp = Date.now();
  const date = moment(`${timestamp}`, 'x').format('YYYY-MM-DD HH:mm:ss');
  const component = (
    <Component isFetching timestamp={timestamp} className="Test" />
  );
  const wrapper = shallow(component);
  t.true(wrapper.hasClass('Test'), 'has classname');
  t.true(wrapper.find('i.fa').length === 1, 'has loader icon');
  t.true(wrapper.contains(date), 'has date');
});
