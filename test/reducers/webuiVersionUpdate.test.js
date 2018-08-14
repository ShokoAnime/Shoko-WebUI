import test from 'ava';
import { reducerTest } from 'redux-ava';
import { updateWebui as action } from '../../src/core/actions';
import { webuiVersionUpdate as reducer } from '../../src/core/reducers';

test('webuiVersionUpdate detects error', reducerTest(
  reducer,
  { status: false },
  action({ error: 'Error message' }),
  { error: 'Error message' },
));

test('webuiVersionUpdate detects success', reducerTest(
  reducer,
  { status: false },
  action({ status: true }),
  { status: true },
));

test('webuiVersionUpdate detects success after error', reducerTest(
  reducer,
  { error: 'Error message' },
  action({ status: true }),
  { status: true },
));

test('webuiVersionUpdate detects error after success', reducerTest(
  reducer,
  { status: true },
  action({ error: 'Error message' }),
  { error: 'Error message' },
));
