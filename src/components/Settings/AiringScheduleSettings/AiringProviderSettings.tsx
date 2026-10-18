import cx from 'classnames';

import CheckboxGroup from '@/components/Input/CheckboxGroup';
import InputSmall from '@/components/Input/InputSmall';
import MetadataProviderConfiguration from '@/components/Settings/MetadataSitesSettings/MetadataProviderConfiguration';
import { convertMsToTimeSpan, convertTimeSpanToMs } from '@/core/util';
import { getDistinctPluginName } from '@/core/utilities/getDistinctPluginName';

import type { AiringKindType, AiringScheduleProviderType } from '@/core/types/api/airing-schedule';

type Props = {
  onChange: (provider: AiringScheduleProviderType) => void;
  provider: AiringScheduleProviderType;
};

const kindLabels: Record<AiringKindType, string> = {
  Original: 'Original Broadcasts',
  Subtitled: 'Subtitled Releases',
  Dubbed: 'Dubbed Releases',
};

// The server clamps an interval under fifteen minutes, and the time span helpers are right up to 30 days; the input
// holds the value within these.
const MIN_SWEEP_HOURS = 0.25;
const MAX_SWEEP_HOURS = 720;
const MS_PER_HOUR = 3_600_000;

const AiringProviderSettings = ({ onChange, provider }: Props) => {
  const isActive = provider.EnabledKinds.length > 0;
  const pluginName = getDistinctPluginName(provider.Name, provider.Plugin.Name);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2 font-semibold">
            {provider.HasIcon && (
              <img
                className="size-5"
                src={`/api/v3/AiringSchedule/Provider/${encodeURIComponent(provider.ID)}/Icon`}
                alt=""
              />
            )}
            {provider.Name}
            {pluginName && <span className="text-xs font-normal opacity-65">{`(${pluginName})`}</span>}
          </div>
          <span className={cx('text-sm font-semibold', isActive ? 'text-panel-text-important' : 'opacity-65')}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {provider.Description && <div className="text-sm opacity-65">{provider.Description}</div>}
      </div>

      <div className="flex flex-col gap-y-1">
        <CheckboxGroup
          idPrefix={`airing-${provider.ID}`}
          options={provider.AvailableKinds.map(kind => ({ label: kindLabels[kind], value: kind }))}
          selected={provider.EnabledKinds}
          onChange={kinds => onChange({ ...provider, EnabledKinds: kinds })}
        />
        <div className="text-sm opacity-65">
          The kinds of airings the provider fetches. With none, the provider is inactive.
        </div>
      </div>

      {provider.IsSwept && (
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            Sweep Every (Hours)
            <InputSmall
              id={`airing-${provider.ID}-sweep`}
              type="number"
              allowFloat
              min={MIN_SWEEP_HOURS}
              max={MAX_SWEEP_HOURS}
              value={convertTimeSpanToMs(provider.SweepInterval) / MS_PER_HOUR}
              onChange={(event) => {
                if (Number.isNaN(event.target.valueAsNumber)) return;
                const interval = convertMsToTimeSpan(Math.round(event.target.valueAsNumber * MS_PER_HOUR));
                onChange({ ...provider, SweepInterval: interval });
              }}
              className="w-20 px-3 py-1 text-center"
            />
          </div>
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
