import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import calendar from 'dayjs/plugin/calendar';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';
import durationPlugin from 'dayjs/plugin/duration';
import formatThousands from 'format-thousands';
import { enableMapSet } from 'immer';
import { reduce, toNumber } from 'lodash';
import semver from 'semver';

import toast from '@/components/Toast';

import type { ShokoError } from '@/core/types/api';
import type { AxiosError } from 'axios';

dayjs.extend(advancedFormat);
dayjs.extend(calendar);
dayjs.extend(durationPlugin);
dayjs.extend(customParseFormatPlugin);

export { default as dayjs } from 'dayjs';

// Enables immer plugin to support Map and Set
enableMapSet();

const { DEV, VITE_APPVERSION, VITE_GITHASH, VITE_MIN_SERVER_VERSION, VITE_MAX_SERVER_VERSION } = import.meta.env;

export const isDebug = () => DEV;
export const getUiVersion = () => (DEV ? VITE_GITHASH : VITE_APPVERSION);
export const getMinimumServerVersion = () => VITE_MIN_SERVER_VERSION;
export const getMaximumServerVersion = () => VITE_MAX_SERVER_VERSION;

// First Web UI version that supports servers at or above the maximum server version
export const MIN_WEBUI_VERSION_FOR_NEWER_SERVER = '2.6.0';

export const parseServerVersion = (version: string) => {
  const semverVersion = semver.coerce(version)?.raw;
  const prereleaseVersion = version.split('.').pop();

  if (!semverVersion || !prereleaseVersion) return null;

  return `${semverVersion}-dev.${prereleaseVersion}`;
};

export const getParsedSupportedServerVersion = () => parseServerVersion(VITE_MIN_SERVER_VERSION)!;

export type ServerSupport = 'supported' | 'tooOld' | 'tooNew';

export const getServerSupport = (serverVersion: string): ServerSupport => {
  const parsed = parseServerVersion(serverVersion);
  if (!parsed) return 'supported';
  if (semver.lt(parsed, parseServerVersion(VITE_MIN_SERVER_VERSION)!)) return 'tooOld';
  if (semver.gte(parsed, parseServerVersion(VITE_MAX_SERVER_VERSION)!)) return 'tooNew';
  return 'supported';
};

// Whether a Web UI release (as reported by the update check) works with servers newer than this Web UI supports
export const isWebUiNewServerCompatible = (webuiVersion: string) => {
  const coerced = semver.coerce(webuiVersion);
  return !!coerced && semver.gte(coerced, MIN_WEBUI_VERSION_FOR_NEWER_SERVER);
};

export const formatThousand = (num: number) => formatThousands(num, ',');

export const copyToClipboard = async (text: string, entityName?: string) => {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      copy(text);
    }
    if (entityName) toast.success(`${entityName} has been copied to the clipboard!`);
  } catch (error) {
    if (entityName) toast.error(`${entityName} copy failed!`);
    throw error;
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

export const padNumber = (num: number | string, size = 2) => num.toString().padStart(size, '0');

export const processError = (axiosError: AxiosError) => {
  const errorData = axiosError.response?.data as ShokoError;
  if (!errorData) return 'Please check the logs.';

  const errors = reduce(
    errorData.errors,
    (result, value, _) => result.concat(value),
    [] as string[],
  );

  return errors.join(', ');
};
