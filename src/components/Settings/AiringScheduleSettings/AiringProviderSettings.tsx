import { useState } from 'react';
import cx from 'classnames';

import AiringProviderIcon from '@/components/AiringProviderIcon';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import MetadataProviderConfiguration from '@/components/Settings/MetadataSitesSettings/MetadataProviderConfiguration';
import { convertTimeSpanToMs, padNumber } from '@/core/util';
import { getDistinctPluginName } from '@/core/utilities/getDistinctPluginName';

import type { AiringKindType, AiringScheduleProviderType } from '@/core/types/api/airing-schedule';

type Props = {
  provider: AiringScheduleProviderType;
  /** Takes a change to the provider into the draft. */
  onChange: (provider: AiringScheduleProviderType) => void;
};

const MINUTES_PER_UNIT = { minutes: 1, hours: 60, days: 1440 };
type UnitType = keyof typeof MINUTES_PER_UNIT;

const kindDescriptions: Record<AiringKindType, string> = {
  Original: 'Original Broadcasts',
  Subtitled: 'Subtitled Releases',
  Dubbed: 'Dubbed Releases',
};

const toMinutes = (timeSpan: string) => Math.round(convertTimeSpanToMs(timeSpan) / 60000);

const toTimeSpan = (totalMinutes: number) => {
  const days = Math.floor(totalMinutes / 1440);
  const time = `${padNumber(Math.floor((totalMinutes % 1440) / 60))}:${padNumber(totalMinutes % 60)}:00`;
  return days > 0 ? `${days}.${time}` : time;
};

const getLargestUnit = (minutes: number): UnitType => {
  if (minutes > 0 && minutes % MINUTES_PER_UNIT.days === 0) return 'days';
  if (minutes > 0 && minutes % MINUTES_PER_UNIT.hours === 0) return 'hours';
  return 'minutes';
};

/** The sweep interval as an amount and a unit, sent to the server as a time span. */
const SweepInterval = ({ id, onChange, value }: { id: string, onChange: (value: string) => void, value: string }) => {
  const minutes = toMinutes(value);
  const [unit, setUnit] = useState<UnitType>(() => getLargestUnit(minutes));
  const amount = Math.round((minutes / MINUTES_PER_UNIT[unit]) * 100) / 100;

  return (
    <div className="flex items-center justify-between">
      Sweep Interval
      <div className="flex items-center gap-x-2">
        <InputSmall
          id={id}
          type="number"
          allowFloat
          value={amount}
          onChange={(event) => {
            if (Number.isNaN(event.target.valueAsNumber)) return;
            onChange(toTimeSpan(Math.max(Math.round(event.target.valueAsNumber * MINUTES_PER_UNIT[unit]), 1)));
          }}
          className="w-16 px-3 py-1"
        />
        <SelectSmall
          id={`${id}-unit`}
          value={unit}
          onChange={(event) => {
            const newUnit = event.target.value as UnitType;
            setUnit(newUnit);
            onChange(toTimeSpan(Math.max(Math.round(amount * MINUTES_PER_UNIT[newUnit]), 1)));
          }}
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </SelectSmall>
      </div>
    </div>
  );
};

/**
 * One airing schedule provider: the kinds of airings it fetches, how often it sweeps, and its own configuration. The
 * kinds and the interval go into the draft; the configuration is saved with its own button.
 */
const AiringProviderSettings = ({ onChange, provider }: Props) => {
  // A provider is active while any of its kinds is enabled.
  const isEnabled = provider.EnabledKinds.length > 0;
  const pluginName = getDistinctPluginName(provider.Name, provider.Plugin.Name);

  const handleKindToggle = (kind: AiringKindType, checked: boolean) => {
    const kinds = new Set(provider.EnabledKinds);
    if (checked) kinds.add(kind);
    else kinds.delete(kind);
    // Kept in the order the provider declares them, as the server answers.
    onChange({ ...provider, EnabledKinds: provider.AvailableKinds.filter(available => kinds.has(available)) });
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2 font-semibold">
            <AiringProviderIcon providerId={provider.ID} hasIcon={provider.HasIcon} />
            {provider.Name}
            {pluginName && <span className="text-xs font-normal opacity-65">{`(${pluginName})`}</span>}
          </div>
          <span className={cx('text-sm font-semibold', isEnabled ? 'text-panel-text-important' : 'opacity-65')}>
            {isEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        {provider.Description && <div className="text-sm opacity-65">{provider.Description}</div>}
      </div>

      <div className="flex flex-col gap-y-2">
        <div>Kinds</div>
        <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {provider.AvailableKinds.map(kind => (
            <Checkbox
              key={kind}
              justify
              id={`airing-${provider.ID}-${kind}`}
              label={kindDescriptions[kind]}
              isChecked={provider.EnabledKinds.includes(kind)}
              onChange={event => handleKindToggle(kind, event.target.checked)}
            />
          ))}
        </div>
        <div className="text-sm opacity-65">
          The kinds of airings the provider fetches. With none, the provider is inactive.
        </div>
      </div>

      {provider.IsSwept && (
        <div className="flex flex-col gap-y-1">
          <SweepInterval
            id={`airing-${provider.ID}-sweep`}
            value={provider.SweepInterval}
            onChange={value => onChange({ ...provider, SweepInterval: value })}
          />
          <div className="text-sm opacity-65">
            How long after a sweep through every series it covers the provider starts the next one.
          </div>
        </div>
      )}

      {provider.Configuration && (
        <MetadataProviderConfiguration configuration={provider.Configuration} providerName={provider.Name} />
      )}
    </div>
  );
};

export default AiringProviderSettings;
