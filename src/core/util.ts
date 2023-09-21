/* eslint-disable no-param-reassign */
import { compareItems, rankItem } from '@tanstack/match-sorter-utils';
import { sortingFns } from '@tanstack/react-table';
import copy from 'copy-to-clipboard';
import formatThousands from 'format-thousands';
import { isObject } from 'lodash';

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RankingInfo } from '@tanstack/match-sorter-utils';
import type { FilterFn, SortingFn } from '@tanstack/react-table';

const { DEV, VITE_APPVERSION, VITE_GITHASH } = import.meta.env;

export function uiVersion() {
  return DEV ? VITE_GITHASH : VITE_APPVERSION;
}

export function isDebug() {
  return DEV;
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

// tanstack table helpers

declare module '@tanstack/table-core' {
  /* eslint-disable-next-line  @typescript-eslint/consistent-type-definitions */
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  /* eslint-disable-next-line  @typescript-eslint/consistent-type-definitions */
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const fuzzyFilter: FilterFn<object> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

export const fuzzySort: SortingFn<object> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId].itemRank!,
      rowB.columnFiltersMeta[columnId].itemRank!,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

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
