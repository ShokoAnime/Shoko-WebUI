import { isAxiosError } from 'axios';
import { toNumber } from 'lodash';

import { convertTimeSpanToMs, dayjs, padNumber } from '@/core/util';

import type {
  ActionTriggerTypeValues,
  DayOfWeekValues,
  ScheduledActionStateValues,
  ScheduledActionTriggerType,
  ScheduledActionType,
} from '@/core/types/api/scheduled-action';

/** The fields a trigger type takes. */
export type TriggerFieldValues = 'interval' | 'timeOfDay' | 'daysOfWeek' | 'daysOfMonth';

type TriggerTypeDefinitionType = {
  label: string;
  fields: TriggerFieldValues[];
};

/**
 * The trigger types the editor knows, keyed by type, with the fields each takes. The server may report a type that is
 * missing here, so lookups are guarded and fall back to the raw type, which is then kept as it is on save.
 */
export const triggerTypes: Record<ActionTriggerTypeValues, TriggerTypeDefinitionType> = {
  Interval: { label: 'Interval', fields: ['interval'] },
  Daily: { label: 'Daily', fields: ['timeOfDay'] },
  Weekly: { label: 'Weekly', fields: ['daysOfWeek', 'timeOfDay'] },
  Monthly: { label: 'Monthly', fields: ['daysOfMonth', 'timeOfDay'] },
  Startup: { label: 'At start-up', fields: [] },
  QueueCleared: { label: 'When the queue is cleared', fields: [] },
};

export const daysOfWeek: DayOfWeekValues[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MINUTES_PER_DAY = 1440;

/** The largest interval a trigger takes, in minutes: 366 days. */
export const maximumIntervalMinutes = 366 * MINUTES_PER_DAY;

/** A .NET TimeSpan string as whole minutes. */
export const timeSpanToMinutes = (
  timeSpan: string | null | undefined,
) => (timeSpan ? Math.round(convertTimeSpanToMs(timeSpan) / 60000) : 0);

/** Whole minutes as a .NET TimeSpan string, e.g. `1.06:00:00`. */
export const minutesToTimeSpan = (minutes: number) => {
  const days = Math.floor(minutes / MINUTES_PER_DAY);
  const time = `${padNumber(Math.floor((minutes % MINUTES_PER_DAY) / 60))}:${padNumber(minutes % 60)}:00`;
  return days > 0 ? `${days}.${time}` : time;
};

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

/** Whole minutes in words, e.g. "1 day 6 hours". */
export const describeMinutes = (minutes: number) => {
  const parts = [
    [Math.floor(minutes / MINUTES_PER_DAY), 'day'],
    [Math.floor((minutes % MINUTES_PER_DAY) / 60), 'hour'],
    [minutes % 60, 'minute'],
  ] as const;
  const text = parts.filter(([count]) => count > 0).map(([count, unit]) => plural(count, unit)).join(' ');
  return text || '0 minutes';
};

/** A `HH:mm:ss` time of day as `HH:mm`, as a time input takes it. */
export const toTimeInput = (timeOfDay: string | null | undefined) => (timeOfDay ?? '').slice(0, 5);

/** A time input's `HH:mm` as the `HH:mm:ss` the server takes. */
export const fromTimeInput = (value: string) => (value ? `${value}:00` : null);

const toOrdinal = (value: number) => {
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};

/** A day of the month, counted from the start (1 to 31) or from the end (-1 to -31). */
export const describeDayOfMonth = (day: number) => {
  if (day === -1) return 'the last day';
  if (day < 0) return `the ${toOrdinal(-day)} day from the end`;
  return `the ${toOrdinal(day)}`;
};

/** Reads a list of days of the month such as `1, 15, -1`, dropping what is not a whole number. */
export const parseDaysOfMonth = (text: string) =>
  text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(toNumber)
    .filter(day => Number.isInteger(day) && day !== 0);

/** A trigger in words, e.g. "Weekly on Monday and Friday at 04:00". */
export const describeTrigger = (trigger: ScheduledActionTriggerType) => {
  const time = toTimeInput(trigger.TimeOfDay);
  switch (trigger.Type) {
    case 'Interval':
      return `Every ${describeMinutes(timeSpanToMinutes(trigger.Interval))}`;
    case 'Daily':
      return `Daily at ${time}`;
    case 'Weekly':
      return `Weekly on ${(trigger.DaysOfWeek ?? []).join(', ')} at ${time}`;
    case 'Monthly':
      return `Monthly on ${(trigger.DaysOfMonth ?? []).map(describeDayOfMonth).join(', ')} at ${time}`;
    case 'Startup':
    case 'QueueCleared':
      return triggerTypes[trigger.Type]?.label ?? trigger.Type;
    default:
      return trigger.Type;
  }
};

/** A new trigger of a type, with fields to start from that respect the action's minimum interval. */
export const createTrigger = (type: ActionTriggerTypeValues, minimumMinutes: number): ScheduledActionTriggerType => {
  const fields = triggerTypes[type]?.fields ?? [];
  return {
    Type: type,
    Interval: fields.includes('interval') ? minutesToTimeSpan(Math.max(minimumMinutes, 60)) : null,
    TimeOfDay: fields.includes('timeOfDay') ? '03:00:00' : null,
    DaysOfWeek: fields.includes('daysOfWeek') ? ['Monday'] : null,
    DaysOfMonth: fields.includes('daysOfMonth') ? [1] : null,
  };
};

/** Whether a run is in the queue: waiting, running or being cancelled. */
export const isBusy = (state: ScheduledActionStateValues) => state !== 'Idle';

const RUN_TIME_FORMAT = 'MMMM Do, HH:mm';

export const formatRunTime = (time: string) => dayjs(time).format(RUN_TIME_FORMAT);

// Without a next run time, the triggers have no time of their own (start-up, the queue being cleared), or there are
// none.
export const describeNextRun = (nextRunAt: string | null, triggersText: string) => {
  if (!nextRunAt) return triggersText || 'Manual only';
  return dayjs(nextRunAt).isBefore(dayjs()) ? 'Due now' : formatRunTime(nextRunAt);
};

export const getStateBadge = (action: ScheduledActionType) => {
  switch (action.State) {
    case 'Waiting':
      return { className: 'text-panel-text-warning', label: 'Waiting in Queue' };
    case 'Running':
      return {
        className: 'text-panel-text-primary',
        label: action.Progress === null ? 'Running' : `Running ${Math.round(action.Progress)}%`,
      };
    case 'CancellationRequested':
      return { className: 'text-panel-text-danger', label: 'Cancelling' };
    default:
      return null;
  }
};

// The server's validation problem, by member: `[0]` for the first trigger, the empty key for the triggers as a whole.
export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (!isAxiosError(error)) return {};
  const data = error.response?.data as { errors?: Record<string, string[]> } | undefined;
  return data?.errors ?? {};
};
