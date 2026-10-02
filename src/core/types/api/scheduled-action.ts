/**
 * What makes a scheduled action run on its own. The known types are listed in
 * `core/react-query/scheduled-action/helpers.ts`; a type the WebUI does not know yet is shown by name and kept as it is.
 */
export type ActionTriggerTypeValues =
  | 'Interval'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Startup'
  | 'QueueCleared'
  | (string & {});

export type DayOfWeekValues = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/** A trigger of a scheduled action. Each type sets only its own fields; the others are `null` or left out. */
export type ScheduledActionTriggerType = {
  Type: ActionTriggerTypeValues;
  /** For `Interval`: a .NET TimeSpan string in whole minutes, e.g. `06:00:00` or `1.00:00:00`. */
  Interval?: string | null;
  /** For `Daily`, `Weekly` and `Monthly`: `HH:mm:ss` in the server's time zone, in whole minutes. */
  TimeOfDay?: string | null;
  /** For `Weekly`: at least one day, each once. */
  DaysOfWeek?: DayOfWeekValues[] | null;
  /** For `Monthly`: 1 to 31 from the start of the month, or -1 to -31 from its end (-1 is the last day). */
  DaysOfMonth?: number[] | null;
};

export type ScheduledActionStateValues = 'Idle' | 'Waiting' | 'Running' | 'CancellationRequested';

/** A scheduled action, from `GET Action/Scheduled`. */
export type ScheduledActionType = {
  ID: string;
  Name: string;
  Description: string | null;
  Category: string;
  /** The category's display name, the owning plugin's name for a plugin's own. */
  CategoryName: string;
  RequiresConfirmation: boolean;
  ConfirmationMessage: string | null;
  /** The triggers in effect: the admin's, or the defaults. Empty when it only runs by hand. */
  Triggers: ScheduledActionTriggerType[];
  DefaultTriggers: ScheduledActionTriggerType[];
  /** The shortest time between runs on its own, as a .NET TimeSpan string. */
  MinimumInterval: string;
  /** Whether a run by hand counts for the schedule, so the triggers count from `LastRunAt`. */
  ScheduleCountsManualRuns: boolean;
  HasCustomTriggers: boolean;
  LastRunAt: string | null;
  LastScheduledRunAt: string | null;
  /** When a trigger queues it next; in the past for a run about to be queued. */
  NextRunAt: string | null;
  State: ScheduledActionStateValues;
  /** How far the running job is, from 0 to 100, when it reports. */
  Progress: number | null;
  IsCancellable: boolean;
  JobKey: string;
};
