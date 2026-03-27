import type React from 'react';
import type { RefObject } from 'react';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import calendar from 'dayjs/plugin/calendar';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';
import durationPlugin from 'dayjs/plugin/duration';
import formatThousands from 'format-thousands';
import { enableMapSet } from 'immer';
import { reduce, toNumber } from 'lodash';

import toast from '@/components/Toast';

import type { EpisodeType } from './types/api/episode';
import type { FileType } from './types/api/file';
import type { SeriesType } from './types/api/series';
import type { ManualLinkType } from './types/utilities/unrecognized-utility';
import type { ShokoError } from '@/core/types/api';
import type { AxiosError } from 'axios';

dayjs.extend(advancedFormat);
dayjs.extend(calendar);
dayjs.extend(durationPlugin);
dayjs.extend(customParseFormatPlugin);

export { default as dayjs } from 'dayjs';

// Enables immer plugin to support Map and Set
enableMapSet();

const { DEV, VITE_APPVERSION, VITE_GITHASH, VITE_MIN_SERVER_VERSION } = import.meta.env;

export const isDebug = () => DEV;
export const getMinimumServerVersion = () => VITE_MIN_SERVER_VERSION;
export const getUiVersion = () => (DEV ? VITE_GITHASH : VITE_APPVERSION);

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

const selectRowId = (target: EpisodeType | FileType | ManualLinkType | SeriesType) => {
  // ManualLinkType
  if ('id' in target) return target.id;

  // FileType
  if ('ID' in target) return target.ID;

  // EpisodeType | SeriesType
  return target.IDs.ID;
};
/**
 * Handles row selection with shift-key range selection support.
 * When shift is held, selects all rows between the last clicked row and current row.
 */
export const handleShiftSelect = (params: {
  event: React.KeyboardEvent | React.MouseEvent;
  handleRowSelect: (id: number, select: boolean) => void;
  index: number;
  lastRowIndex: RefObject<number | undefined>;
  rowSelection: Record<number, boolean>;
  rows: EpisodeType[] | FileType[] | ManualLinkType[] | SeriesType[];
  setRowSelection?: (selectedRows: Record<number, boolean>) => void;
}) => {
  const { event, handleRowSelect, index, lastRowIndex, rowSelection, rows, setRowSelection } = params;
  try {
    if (setRowSelection && event.shiftKey) {
      const lrIndex = lastRowIndex.current ?? index;
      const fromIndex = Math.min(lrIndex, index);
      const toIndex = Math.max(lrIndex, index);
      const isSelected = lastRowIndex.current !== undefined
        ? rowSelection[selectRowId(rows[lastRowIndex.current])]
        : true;
      const tempRowSelection: Record<number, boolean> = {};
      for (let idx = fromIndex; idx <= toIndex; idx += 1) {
        const id = selectRowId(rows[idx]);
        tempRowSelection[id] = isSelected;
      }
      setRowSelection(tempRowSelection);
    } else if (window.getSelection?.()?.type !== 'Range') {
      const id = selectRowId(rows[index]);
      handleRowSelect(id, !rowSelection[id]);
      // Required to track last row index for shift-select range selection
      lastRowIndex.current = index;
    }
  } catch (error) {
    console.error(error);
  }
};
