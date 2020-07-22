/* eslint-disable no-param-reassign */
import { each, unset, isObject } from 'lodash';
import Version from '../../public/version.json';

export function uiVersion() {
  return Version.debug ? Version.git : Version.package;
}

export function mergeDeep(...objects) {
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = Array.from(new Set(pVal.concat(...oVal)));
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

// Needed to compare layout properties.
// Stolen from https://stackoverflow.com/questions/37246775/
export function omitDeepBy(value: any, iteratee: Function) {
  each(value, (v, k) => {
    if (iteratee(v, k)) {
      unset(value, k);
    } else if (isObject(v)) {
      omitDeepBy(v, iteratee);
    }
  });

  return value;
}

export default {};
