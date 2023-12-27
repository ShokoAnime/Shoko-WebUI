/* eslint-disable no-param-reassign */
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import calendar from 'dayjs/plugin/calendar';
import durationPlugin from 'dayjs/plugin/duration';
import formatThousands from 'format-thousands';
import { isObject, toNumber } from 'lodash';

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

dayjs.extend(advancedFormat);
dayjs.extend(calendar);
dayjs.extend(durationPlugin);

export { default as dayjs } from 'dayjs';

const { DEV, VITE_APPVERSION, VITE_GITHASH } = import.meta.env;

export function uiVersion() {
  return DEV ? VITE_GITHASH : VITE_APPVERSION;
}

export function isDebug() {
  return DEV;
}

export function mergeDeep(...objects: object[]) {
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal: unknown = prev[key];
      const oVal: unknown = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = Array.from(new Set(pVal.concat(...oVal as [])));
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

export const formatThousand = (n: number) => formatThousands(n, ',');

export const copyToClipboard = async (text: string) => {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return copy(text);
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * To convert TimeSpan returned by ASP.NET for duration (eg. 00:24:02.2424) to milliseconds
 */
export const convertTimeSpanToMs = (timeSpan: string) => {
  const [duration, durationMs] = timeSpan.split('.');
  const [hours, minutes, seconds] = duration.split(':');
  return (((toNumber(hours) * 3600) + (toNumber(minutes) * 60) + toNumber(seconds)) * 1000)
    + toNumber((durationMs ?? '0').slice(0, 3));
};

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown,
): error is { message: string } {
  return (
    typeof error === 'object'
    && error != null
    && 'message' in error
    && typeof (error as Error).message === 'string'
  );
}

export default {};
