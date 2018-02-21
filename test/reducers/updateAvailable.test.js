import test from 'ava';
import { reducerTest } from 'redux-ava';
import proxyquire from 'proxyquire';
import { createAction } from 'redux-actions';
import { UPDATE_AVAILABLE } from '../../src/core/actions';

const action = createAction(UPDATE_AVAILABLE);

const reducersProd = proxyquire('../../src/core/reducers', {
  '../../public/version.json': {
    package: '0.3.3',
    git: '494902a',
    debug: false,
  },
});
const reducerProd = reducersProd.updateAvailable;

test('updateAvailable detects different version', reducerTest(
  reducerProd,
  false,
  action({ version: '0.3.2' }),
  true,
));

const reducersDebug = proxyquire('../../src/core/reducers', {
  '../../public/version.json': {
    package: '0.3.3',
    git: '494902a',
    debug: true,
  },
});

const reducerDebug = reducersDebug.updateAvailable;

test('updateAvailable detects same version', reducerTest(
  reducerProd,
  false,
  action({ version: '0.3.3' }),
  false,
));

test('updateAvailable false in debug on different version', reducerTest(
  reducerDebug,
  false,
  action({ version: '0.3.2' }),
  false,
));

test('updateAvailable false in debug on same version', reducerTest(
  reducerDebug,
  false,
  action({ version: '0.3.3' }),
  false,
));
