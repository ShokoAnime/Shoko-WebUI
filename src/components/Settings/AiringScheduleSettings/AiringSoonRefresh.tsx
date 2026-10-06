import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';

import type { AiringSoonRefreshOptionsType } from '@/core/types/api/airing-schedule';

/** The window the server accepts, in hours: one hour to a week. */
const MINIMUM_WINDOW_HOURS = 1;
const MAXIMUM_WINDOW_HOURS = 168;

type Props = {
  options: AiringSoonRefreshOptionsType;
  /** Takes a changed option into the draft. */
  onChange: <TKey extends keyof AiringSoonRefreshOptionsType>(
    key: TKey,
    value: AiringSoonRefreshOptionsType[TKey],
  ) => void;
};

/** The window of the "Refresh Anime Airing Soon" scheduled action, and whether date-only airings count in it. */
const AiringSoonRefresh = ({ onChange, options }: Props) => (
  <div className="flex flex-col gap-y-1">
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center justify-between">
        Airing Soon Window (Hours)
        <InputSmall
          id="airing-soon-window-hours"
          type="number"
          min={MINIMUM_WINDOW_HOURS}
          max={MAXIMUM_WINDOW_HOURS}
          value={options.AiringSoonWindowHours}
          onChange={(event) => {
            if (Number.isNaN(event.target.valueAsNumber)) return;
            onChange('AiringSoonWindowHours', event.target.valueAsNumber);
          }}
          className="w-16 px-3 py-1 text-center"
        />
      </div>
      <div className="text-sm opacity-65">
        How far ahead an episode airing makes the action refresh its anime, from one hour to a week.
      </div>
    </div>
    <div className="flex flex-col gap-y-1">
      <Checkbox
        id="airing-soon-include-date-only"
        justify
        label="Include Date-Only Airings"
        isChecked={options.AiringSoonIncludeDateOnly}
        onChange={event => onChange('AiringSoonIncludeDateOnly', event.target.checked)}
      />
      <div className="text-sm opacity-65">
        Also count the episodes AniDB knows only the air date of, when that day (in UTC) overlaps the window.
      </div>
    </div>
  </div>
);

export default AiringSoonRefresh;
