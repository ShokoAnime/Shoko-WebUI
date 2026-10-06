import { useState } from 'react';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import {
  MINUTES_PER_DAY,
  daysOfWeek,
  describeMinutes,
  fromTimeInput,
  getTriggerLabel,
  getTriggerType,
  maximumIntervalMinutes,
  minutesToTimeSpan,
  parseDaysOfMonth,
  timeSpanToMinutes,
  toTimeInput,
} from '@/core/react-query/scheduled-action/helpers';

import type { ScheduledActionTriggerType } from '@/core/types/api/scheduled-action';

type Props = {
  id: string;
  trigger: ScheduledActionTriggerType;
  minimumMinutes: number;
  /** The server's errors for this trigger. */
  errors?: string[];
  onChange: (trigger: ScheduledActionTriggerType) => void;
  onRemove: () => void;
};

const units = [
  { label: 'Minutes', minutes: 1 },
  { label: 'Hours', minutes: 60 },
  { label: 'Days', minutes: MINUTES_PER_DAY },
];

// The largest unit the interval is a whole number of.
const getUnit = (minutes: number) =>
  [...units].reverse().find(unit => minutes > 0 && minutes % unit.minutes === 0) ?? units[0];

/** One trigger of a scheduled action, with the fields its type takes. */
const TriggerEditor = ({ errors, id, minimumMinutes, onChange, onRemove, trigger }: Props) => {
  const definition = getTriggerType(trigger.Type);
  const fields = definition?.fields ?? [];

  const intervalMinutes = timeSpanToMinutes(trigger.Interval);
  const [unitMinutes, setUnitMinutes] = useState(() => getUnit(intervalMinutes).minutes);
  const [daysOfMonthText, setDaysOfMonthText] = useState(() => (trigger.DaysOfMonth ?? []).join(', '));

  const hasInterval = fields.includes('interval');
  const isUnderMinimum = hasInterval && intervalMinutes < minimumMinutes;
  const isOverMaximum = hasInterval && intervalMinutes > maximumIntervalMinutes;
  const selectedDays = trigger.DaysOfWeek ?? [];

  const updateInterval = (amount: number, unit: number) =>
    onChange({ ...trigger, Interval: minutesToTimeSpan(Math.max(0, Math.round(amount * unit))) });

  // Kept in week order, whatever order the days were checked in.
  const toggleDayOfWeek = (day: (typeof daysOfWeek)[number], checked: boolean) =>
    onChange({
      ...trigger,
      DaysOfWeek: daysOfWeek.filter(item => (item === day ? checked : selectedDays.includes(item))),
    });

  return (
    <div
      className={cx(
        'flex flex-col gap-y-2 rounded-lg border bg-panel-background-alt px-4 py-2',
        errors?.length ? 'border-panel-text-danger' : 'border-panel-border',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{getTriggerLabel(trigger.Type)}</span>
        <Button onClick={onRemove} tooltip="Remove Trigger">
          <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
        </Button>
      </div>

      {hasInterval && (
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between gap-x-2">
            Every
            <div className="flex items-center gap-x-2">
              <InputSmall
                id={`${id}-interval`}
                type="number"
                min={1}
                value={intervalMinutes / unitMinutes}
                onChange={event => updateInterval(toNumber(event.target.value), unitMinutes)}
                className="w-20 px-3 py-1"
                allowFloat
              />
              <SelectSmall
                id={`${id}-interval-unit`}
                value={unitMinutes}
                onChange={(event) => {
                  const unit = toNumber(event.target.value);
                  setUnitMinutes(unit);
                  updateInterval(intervalMinutes / unitMinutes, unit);
                }}
              >
                {units.map(unit => <option key={unit.minutes} value={unit.minutes}>{unit.label}</option>)}
              </SelectSmall>
            </div>
          </div>
          <div className={cx('text-xs', isUnderMinimum || isOverMaximum ? 'text-panel-text-danger' : 'opacity-65')}>
            {`From ${describeMinutes(minimumMinutes)} to ${
              describeMinutes(maximumIntervalMinutes)
            }, counted from the last run.`}
          </div>
        </div>
      )}

      {fields.includes('daysOfWeek') && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {daysOfWeek.map(day => (
            <Checkbox
              key={day}
              id={`${id}-${day}`}
              label={day.slice(0, 3)}
              labelRight
              isChecked={selectedDays.includes(day)}
              onChange={event => toggleDayOfWeek(day, event.target.checked)}
            />
          ))}
        </div>
      )}

      {fields.includes('daysOfMonth') && (
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between gap-x-2">
            Days of the Month
            <InputSmall
              id={`${id}-days-of-month`}
              type="text"
              placeholder="1, 15, -1"
              value={daysOfMonthText}
              onChange={(event) => {
                setDaysOfMonthText(event.target.value);
                onChange({ ...trigger, DaysOfMonth: parseDaysOfMonth(event.target.value) });
              }}
              className="w-40 px-3 py-1"
            />
          </div>
          <div className="text-xs opacity-65">
            1 to 31 from the start of the month, or -1 to -31 from its end (-1 is the last day). A day a month does not
            have is skipped that month.
          </div>
        </div>
      )}

      {fields.includes('timeOfDay') && (
        <div className="flex items-center justify-between gap-x-2">
          At (Server Time)
          <InputSmall
            id={`${id}-time`}
            type="time"
            value={toTimeInput(trigger.TimeOfDay)}
            onChange={event => onChange({ ...trigger, TimeOfDay: fromTimeInput(event.target.value) })}
            className="w-32 px-3 py-1"
          />
        </div>
      )}

      {errors?.map(error => <div key={error} className="text-sm text-panel-text-danger">{error}</div>)}
    </div>
  );
};

export default TriggerEditor;
