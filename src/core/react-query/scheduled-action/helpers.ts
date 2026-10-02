import { toNumber } from 'lodash';

import { convertTimeSpanToMs } from '@/core/util';

import type {
  ActionTriggerTypeValues,
  DayOfWeekValues,
  ScheduledActionStateValues,
  ScheduledActionTriggerType,
} from '@/core/types/api/scheduled-action';

/** The fields a trigger type takes. */
export type TriggerFieldType = 'interval' | 'timeOfDay' | 'daysOfWeek' | 'daysOfMonth';

type TriggerTypeDefinitionType = {
  type: ActionTriggerTypeValues;
  label: string;
  fields: TriggerFieldType[];
};

/**
 * The trigger types the editor can add, with the fields each takes. A new server type is one more entry; a type
 * missing here is still shown by name, and kept as it is when the triggers are saved.
 */
export const triggerTypes: TriggerTypeDefinitionType[] = [
  { type: 'Interval', label: 'Interval', fields: ['interval'] },
  { type: 'Daily', label: 'Daily', fields: ['timeOfDay'] },
  { type: 'Weekly', label: 'Weekly', fields: ['daysOfWeek', 'timeOfDay'] },
  { type: 'Monthly', label: 'Monthly', fields: ['daysOfMonth', 'timeOfDay'] },
  { type: 'Startup', label: 'At Start-Up', fields: [] },
  { type: 'QueueCleared', label: 'When the Queue Is Cleared', fields: [] },
];

export const getTriggerType = (type: ActionTriggerTypeValues) => triggerTypes.find(item => item.type === type);

export const daysOfWeek: DayOfWeekValues[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** The largest interval a trigger takes, in minutes: 366 days. */
export const maximumIntervalMinutes = 366 * 24 * 60;

/** A .NET TimeSpan string as whole minutes. */
export const timeSpanToMinutes = (
  timeSpan: string | null | undefined,
) => (timeSpan ? Math.round(convertTimeSpanToMs(timeSpan) / 60000) : 0);

const pad = (value: number) => value.toString().padStart(2, '0');

/** Whole minutes as a .NET TimeSpan string, e.g. `1.06:00:00`. */
export const minutesToTimeSpan = (minutes: number) => {
  const days = Math.floor(minutes / 1440);
  const time = `${pad(Math.floor((minutes % 1440) / 60))}:${pad(minutes % 60)}:00`;
  return days > 0 ? `${days}.${time}` : time;
};

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

/** Whole minutes in words, e.g. "1 day 6 hours". */
export const describeMinutes = (minutes: number) => {
  const parts = [
    [Math.floor(minutes / 1440), 'day'],
    [Math.floor((minutes % 1440) / 60), 'hour'],
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
      return 'At start-up';
    case 'QueueCleared':
      return 'When the queue is cleared';
    default:
      return getTriggerType(trigger.Type)?.label ?? trigger.Type;
  }
};

/** A new trigger of a type, with fields to start from that respect the action's minimum interval. */
export const createTrigger = (type: ActionTriggerTypeValues, minimumMinutes: number): ScheduledActionTriggerType => {
  const fields = getTriggerType(type)?.fields ?? [];
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
