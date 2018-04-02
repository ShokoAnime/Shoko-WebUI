// @flow
import React from 'react';
import test from 'ava';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Component from '../../../src/components/Panels/FixedPanel';
import styles from '../../../src/components/Panels/styles.css';

configure({ adapter: new Adapter() });

const children = <span>children</span>;
const title = 'Title';
const description = 'Description';
const testTitle = <div className="pull-left">{title}<h6>{description}</h6></div>;

test('no actionName', (t) => {
  const component = (
    <Component title={title} description={description}>
      {children}
    </Component>
  );
  const wrapper = shallow(component);
  t.true(wrapper.contains(testTitle), 'Title and description rendered');
  t.true(wrapper.find('a.btn').length === 0, 'no button rendered');
});

test('with actionName', (t) => {
  let callbackExecuted = false;
  const component = (
    <Component
      title={title}
      description={description}
      actionName="Test"
      onAction={() => { callbackExecuted = true; }}
    >
      {children}
    </Component>
  );
  const wrapper = shallow(component);
  t.true(wrapper.contains(testTitle), 'Title and description rendered');
  const button = wrapper.find('a.btn');
  t.true(button.length === 1, 'action button rendered');
  button.simulate('click');
  t.true(callbackExecuted, 'callback was called');
});

test('with actionName but no onAction', (t) => {
  const component = (
    <Component
      title={title}
      description={description}
      actionName="Test"
      form
      isFetching
    >
      {children}
    </Component>
  );
  const wrapper = shallow(component);
  t.true(wrapper.find(`.${styles['fixed-panel']}`).hasClass(styles.form), 'has .form class');
  t.true(wrapper.find('TimeUpdated').length === 1, 'has TimeUpdated');
  const button = wrapper.find('a.btn');
  t.true(button.length === 1, 'action button rendered');
  button.simulate('click');
});
