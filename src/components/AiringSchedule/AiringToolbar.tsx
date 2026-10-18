import { mdiCalendarToday, mdiChevronLeft, mdiChevronRight, mdiCog, mdiRefresh } from '@mdi/js';
import { Icon } from '@mdi/react';

import AiringFilters from '@/components/AiringSchedule/AiringFilters';
import Button from '@/components/Input/Button';
import MultiStateButton from '@/components/Input/MultiStateButton';
import MenuButton from '@/components/Utilities/Unrecognized/MenuButton';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';

import type { AiringScheduleProviderType } from '@/core/types/api/airing-schedule';

type Props = {
  isRefreshing: boolean;
  nextDisabledReason?: string;
  onRefresh: () => void;
  onSettings: () => void;
  onStep: (offset: 1 | -1) => void;
  onToday: () => void;
  providers: AiringScheduleProviderType[];
  unit: string;
};

const viewStates = [
  { label: 'Season', value: 'season' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Agenda', value: 'agenda' },
];

const groupClassName =
  'flex items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-2 py-2';

const AiringToolbar = (
  { isRefreshing, nextDisabledReason, onRefresh, onSettings, onStep, onToday, providers, unit }: Props,
) => {
  const { setParams, view } = useAiringScheduleParams();

  return (
    <div className="flex items-center justify-between gap-x-3">
      <div className={`${groupClassName} px-4`}>
        <MenuButton onClick={onRefresh} icon={mdiRefresh} name="Refresh" loading={isRefreshing} keybinding="R" />
        <AiringFilters providers={providers} />
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
          <Button onClick={onToday} tooltip={view === 'season' ? 'Current Season' : 'Today'}>
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
