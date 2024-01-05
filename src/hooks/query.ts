import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { forEach } from 'lodash';

export type Query<T> = T & Record<string, string | undefined>;

export function useURLSearch<T extends Query<Record<string, unknown>>>(
  isHash: boolean,
): [value: T, setValue: (value: T | ((previousValue: T) => T), replace?: boolean) => void] {
  const navigate = useNavigate();
  const location = useLocation();
  const getQueryString = useCallback(() => (isHash ? location.hash.slice(1) : location.search), [location, isHash]);
  const [[search, value], setSearch] = useState(() => {
    const currentSearch = getQueryString();
    const currentValue = parseQuery<T>(currentSearch);
    return [currentSearch, currentValue];
  });

  const setValueAndModifyHistory = (valueOrFn: T | ((previousValue: T) => T), replace = false): void => {
    const query = new URLSearchParams();
    const nextValue = typeof valueOrFn === 'function' ? valueOrFn(value) : valueOrFn;
    forEach(nextValue, (val, key) => {
      if (val !== undefined) query.set(key, val);
    });
    const queryString = query.toString();
    let nextTo = location.pathname;
    if (isHash) {
      nextTo += location.search + (queryString ? `#?${queryString}` : '');
    } else {
      nextTo += (queryString ? `#?${queryString}` : '') + location.hash;
    }
    navigate(nextTo, { replace });
  };

  useEffect(() => {
    const currentSearch = getQueryString();
    if (currentSearch !== search) {
      setSearch([currentSearch, parseQuery<T>(currentSearch)]);
    }
  }, [search, getQueryString]);

  return [value, setValueAndModifyHistory];
}

export function useURLParameter(
  key: string,
  initialValue: string,
  isHash?: boolean,
): [value: string, setValue: (value: string | null, replace?: boolean) => void];
export function useURLParameter(
  key: string,
  initialValue?: string | null,
  isHash?: boolean,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void];
export function useURLParameter(
  key: string,
  initialValue: string | null = null,
  isHash = false,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void] {
  const [query, setQuery] = useURLSearch(isHash);
  const currentValue = query[key] ?? initialValue;

  const setQueryParameter = (value: string | null, replace = false) => {
    setQuery(prev => ({ ...prev, [key]: value ?? undefined }), replace);
  };

  return [currentValue, setQueryParameter];
}

export const useURLQuery = <T extends Query<Record<string, unknown>>>() => useURLSearch<T>(false);

export const useHashQuery = <T extends Query<Record<string, unknown>>>() => useURLSearch<T>(true);

export function useQueryParameter(
  key: string,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void];
export function useQueryParameter(
  key: string,
  initialValue: string,
): [value: string, setValue: (value: string | null, replace?: boolean) => void];
export function useQueryParameter(
  key: string,
  initialValue?: string | null,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void];
export function useQueryParameter(
  key: string,
  initialValue?: string | null,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void] {
  return useURLParameter(key, initialValue, false);
}

export function useHashQueryParameter(
  key: string,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void];
export function useHashQueryParameter(
  key: string,
  initialValue: string,
): [value: string, setValue: (value: string | null, replace?: boolean) => void];
export function useHashQueryParameter(
  key: string,
  initialValue?: string | null,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void];
export function useHashQueryParameter(
  key: string,
  initialValue?: string | null,
): [value: string | null, setValue: (value: string | null, replace?: boolean) => void] {
  return useURLParameter(key, initialValue, true);
}

function parseQuery<T extends Query<Record<string, unknown>>>(queryString: string): T {
  const query = new URLSearchParams(queryString);
  return Object.fromEntries(query.entries()) as T;
}
