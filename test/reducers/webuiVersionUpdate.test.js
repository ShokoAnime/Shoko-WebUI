import test from 'ava';
import { reducerTest } from 'redux-ava';
import { createAction } from 'redux-actions';
import { WEBUI_VERSION_UPDATE } from '../../src/core/actions';
import { webuiVersionUpdate as reducer } from '../../src/core/reducers';

const action = createAction(WEBUI_VERSION_UPDATE);

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
