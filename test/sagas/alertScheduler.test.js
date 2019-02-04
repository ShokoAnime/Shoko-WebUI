import test from 'ava';
import { put, delay } from 'redux-saga/effects';
import { GLOBAL_ALERT, SHOW_GLOBAL_ALERT } from '../../src/core/actions';

import saga from '../../src/core/sagas/AlertScheduler';

const alertDisplayTime = 3000;

const alertOne = 'Alert one';
const alertTwo = 'Alert two';
const alertThree = 'Alert three';

test('alertScheduler', (t) => {
  const generatorOne = saga({ payload: alertOne });
  t.deepEqual(generatorOne.next().value, put({ type: GLOBAL_ALERT, payload: [alertOne] }));
  const generatorTwo = saga({ payload: alertTwo });
  t.deepEqual(
    generatorTwo.next().value,
    put({ type: GLOBAL_ALERT, payload: [alertOne, alertTwo] }),
  );

  const generatorThree = saga({ payload: alertThree });
  const callEffect = delay(alertDisplayTime / 2);
  t.deepEqual(generatorThree.next().value, callEffect, 'call delay with 1/2 timeout');
  const putEffect = put({ type: SHOW_GLOBAL_ALERT, payload: alertThree });
  t.deepEqual(generatorThree.next().value, putEffect, 're-queue alert');
  t.true(generatorThree.next().done, 'Gen3 is done');

  const callDelay = delay(alertDisplayTime);
  t.deepEqual(generatorTwo.next().value, callDelay, 'call delay');
  t.deepEqual(generatorOne.next().value, callDelay, 'call delay');

  t.deepEqual(generatorTwo.next().value, put({ type: GLOBAL_ALERT, payload: [alertOne] }), 'alertTwo removed');
  t.true(generatorTwo.next().done, 'Gen2 is done');

  t.deepEqual(generatorOne.next().value, put({ type: GLOBAL_ALERT, payload: [] }), 'alertOne removed');
  t.true(generatorOne.next().done, 'Gen2 is done');
});
