import { mdiCalendarToday, mdiChevronLeft, mdiChevronRight, mdiCog, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import AiringFilters from '@/components/Calendar/AiringFilters';
import Button from '@/components/Input/Button';
import MultiStateButton from '@/components/Input/MultiStateButton';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import { getPeriodUnit } from '@/core/utilities/airingSchedule';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';

type Props = {
  isRefreshing: boolean;
  nextDisabledReason?: string;
  onRefresh: () => void;
  onSettings: () => void;
  onStep: (offset: 1 | -1) => void;
};

const viewStates = [
  { label: 'Season', value: 'season' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Agenda', value: 'agenda' },
];

const groupClassName =
  'flex items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-2 py-2';

const AiringToolbar = ({ isRefreshing, nextDisabledReason, onRefresh, onSettings, onStep }: Props) => {
  const { setParams, view } = useAiringScheduleParams();
  const unit = view === 'season' ? 'season' : getPeriodUnit(view);

  return (
    <div className="flex items-center justify-between gap-x-3">
      <div className={cx(groupClassName, 'px-4')}>
        <MenuButton onClick={onRefresh} icon={mdiRefresh} name="Refresh" loading={isRefreshing} keybinding="R" />
        <AiringFilters />
      </div>
      <div className="flex items-center gap-x-3">
        <MultiStateButton
          className={groupClassName}
          activeState={view}
          states={viewStates}
          onStateChange={newView => setParams({ view: newView === 'season' ? null : newView })}
          alternateColor
          compact
        />
        <div className={groupClassName}>
          <Button onClick={() => onStep(-1)} tooltip={`Previous ${unit}`}>
            <Icon path={mdiChevronLeft} size={1} className="text-panel-icon-action" />
          </Button>
          <Button
            onClick={() => setParams(view === 'season' ? { season: null } : { date: null })}
            tooltip={view === 'season' ? 'Current Season' : 'Today'}
          >
            <Icon path={mdiCalendarToday} size={1} className="text-panel-icon-action" />
          </Button>
          <Button
            onClick={() => onStep(1)}
            tooltip={nextDisabledReason ?? `Next ${unit}`}
            disabled={!!nextDisabledReason}
          >
            <Icon path={mdiChevronRight} size={1} className="text-panel-icon-action" />
          </Button>
        </div>
        <Button buttonType="secondary" className="self-center p-3" onClick={onSettings} tooltip="Settings">
          <Icon path={mdiCog} size={0.8333} />
        </Button>
      </div>
    </div>
  );
};

export default AiringToolbar;
