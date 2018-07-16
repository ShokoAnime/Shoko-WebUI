import test from 'ava';
import { theme, notifications } from '../../../src/core/reducers/settings/UI';
import { setTheme, setNotifications } from '../../../src/core/actions/settings/UI';

test('UI reducers', (t) => {
  t.is('light', theme('light', setTheme(undefined)));
  t.is('light', theme('light', setTheme('')));
  t.is('dark', theme('light', setTheme('dark')));
  t.is(false, notifications(false, setNotifications(undefined)));
  t.is(true, notifications(false, setNotifications(true)));
});
