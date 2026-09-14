import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { mdiCalendarTodayOutline, mdiChevronLeft, mdiChevronRight, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { groupBy, range, sortBy, xor } from 'lodash';
import { useToggle } from 'usehooks-ts';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import MultiStateButton from '@/components/Input/MultiStateButton';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import { useDashboardCalendarEpisodesQuery } from '@/core/react-query/dashboard/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { dayjs, getAnidbAnimeLink } from '@/core/util';
import { getEpisodePrefixAlt } from '@/core/utilities/getEpisodePrefix';

import type { DashboardEpisodeDetailsType } from '@/core/types/api/dashboard';
import type { EpisodeTypeValues } from '@/core/types/api/episode';
import type { Dayjs } from 'dayjs';

type CalendarViewType = 'month' | 'week';

const viewStates: { label?: string, value: CalendarViewType }[] = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
];

const dateKeyFormat = 'YYYY-MM-DD';

const episodeTypeOptions: { label: string, value: EpisodeTypeValues }[] = [
  { label: 'Episodes', value: 'Episode' },
  { label: 'Specials', value: 'Special' },
  { label: 'Credits', value: 'Credits' },
  { label: 'Trailers', value: 'Trailer' },
  { label: 'Parodies', value: 'Parody' },
  { label: 'Others', value: 'Other' },
];

// What the server assumes when no `type` is sent.
const defaultEpisodeTypes: EpisodeTypeValues[] = ['Episode'];

// The day an episode belongs to for the viewer: the local day of the broadcast when the time is known,
// otherwise the (UTC) air date as-is so a date-only entry never drifts to a neighbouring day.
const getLocalDay = (episode: DashboardEpisodeDetailsType) => {
  if (episode.HasAirTime && episode.AiredAt) return dayjs(episode.AiredAt);
  return dayjs(episode.AirDate ?? episode.AiredAt ?? undefined);
};

const getVisibleRange = (anchor: Dayjs, view: CalendarViewType) => {
  if (view === 'week') {
    const start = anchor.startOf('week');
    return { start, end: start.add(6, 'day') };
  }
  return {
    start: anchor.startOf('month').startOf('week'),
    end: anchor.endOf('month').endOf('week').startOf('day'),
  };
};

const weekdayNames = range(7).map(day => dayjs().day(day).format('ddd'));

type EpisodeCardProps = {
  episode: DashboardEpisodeDetailsType;
};

const EpisodeCard = ({ episode }: EpisodeCardProps) => {
  const inCollection = episode.IDs.ShokoSeries !== null;
  const episodeLabel = `${getEpisodePrefixAlt(episode.Type)}${episode.Number} - ${episode.Title}`;
  const airTime = episode.HasAirTime && episode.AiredAt ? dayjs(episode.AiredAt).format('HH:mm') : null;

  const content = (
    <>
      <BackgroundImagePlaceholderDiv
        image={episode.SeriesPoster}
        className="h-12 w-8 shrink-0 rounded-sm border border-panel-border"
      />
      <div className="flex min-w-0 grow flex-col">
        <div className="truncate font-semibold" data-tooltip-id="tooltip" data-tooltip-content={episode.SeriesTitle}>
          {episode.SeriesTitle}
        </div>
        <div className="truncate opacity-65" data-tooltip-id="tooltip" data-tooltip-content={episodeLabel}>
          {episodeLabel}
        </div>
        {airTime && (
          <div
            className={cx('font-semibold', episode.IsAirTimeEstimated ? 'opacity-65' : 'text-panel-text-primary')}
            data-tooltip-id="tooltip"
            data-tooltip-content={episode.IsAirTimeEstimated ? 'Estimated' : ''}
          >
            {episode.IsAirTimeEstimated ? `~${airTime}` : airTime}
          </div>
        )}
      </div>
    </>
  );

  const cardClassName = cx(
    'flex gap-x-2 rounded-md border border-panel-border p-1.5 text-xs transition-colors hover:bg-panel-toggle-background-hover',
    inCollection ? 'bg-panel-background-alt' : 'bg-panel-background opacity-75',
  );

  if (inCollection) {
    return (
      <Link to={`/webui/collection/series/${episode.IDs.ShokoSeries}`} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <a href={getAnidbAnimeLink(episode.IDs.Series)} target="_blank" rel="noopener noreferrer" className={cardClassName}>
      {content}
    </a>
  );
};

const Calendar = () => {
  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;

  const [view, setView] = useState<CalendarViewType>('month');
  const [anchor, setAnchor] = useState(() => dayjs().startOf('day'));
  const [includeMissing, toggleIncludeMissing] = useToggle(false);
  const [includeRestricted, toggleIncludeRestricted] = useToggle(!hideR18Content);
  const [onlyWithAirTime, toggleOnlyWithAirTime] = useToggle(false);
  const [episodeTypes, setEpisodeTypes] = useState<EpisodeTypeValues[]>(defaultEpisodeTypes);

  const handleViewChange = (newView: CalendarViewType) => {
    setView(newView);
  };

  const toggleEpisodeType = (type: EpisodeTypeValues) => {
    setEpisodeTypes(prev => xor(prev, [type]));
  };

  // Leave the parameter out when the selection matches the server default.
  const isDefaultEpisodeTypes = xor(episodeTypes, defaultEpisodeTypes).length === 0;

  const visibleRange = useMemo(() => getVisibleRange(anchor, view), [anchor, view]);

  // The server works in UTC days while the grid is in local days, so pad the request by a day on each side.
  const episodesQuery = useDashboardCalendarEpisodesQuery({
    startDate: visibleRange.start.subtract(1, 'day').format(dateKeyFormat),
    endDate: visibleRange.end.add(1, 'day').format(dateKeyFormat),
    includeMissing: includeMissing ? 'True' : 'False',
    includeRestricted: includeRestricted ? 'True' : 'False',
    includeWithAirTime: onlyWithAirTime ? 'Only' : 'True',
    type: isDefaultEpisodeTypes ? undefined : episodeTypes,
  });

  const days = useMemo(() => {
    const dayCount = visibleRange.end.diff(visibleRange.start, 'day') + 1;
    return range(dayCount).map(offset => visibleRange.start.add(offset, 'day'));
  }, [visibleRange]);

  const episodesByDay = useMemo(() => {
    const sorted = sortBy(episodesQuery.data ?? [], [
      episode => (episode.HasAirTime && episode.AiredAt ? dayjs(episode.AiredAt).valueOf() : 0),
      'SeriesTitle',
      'Number',
    ]);
    return groupBy(sorted, episode => getLocalDay(episode).format(dateKeyFormat));
  }, [episodesQuery.data]);

  const visibleEpisodeCount = useMemo(
    () => days.reduce((count, day) => count + (episodesByDay[day.format(dateKeyFormat)]?.length ?? 0), 0),
    [days, episodesByDay],
  );

  const today = dayjs().format(dateKeyFormat);
  const unit = view === 'week' ? 'week' : 'month';
  const rangeLabel = view === 'week'
    ? `${visibleRange.start.format('MMM D')} – ${visibleRange.end.format('MMM D, YYYY')}`
    : anchor.format('MMMM YYYY');

  return (
    <>
      <title>Calendar | Shoko</title>
      <div className="flex grow flex-col gap-y-6">
        <div>
          <ShokoPanel
            title="Calendar"
            options={<ItemCount count={visibleEpisodeCount} suffix="Episodes" />}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-x-2">
                <Button
                  buttonType="secondary"
                  buttonSize="normal"
                  className="py-3"
                  onClick={() => setAnchor(prev => prev.subtract(1, unit))}
                  tooltip={`Previous ${unit}`}
                >
                  <Icon path={mdiChevronLeft} size={1} />
                </Button>
                <Button
                  buttonType="secondary"
                  buttonSize="normal"
                  className="flex items-center gap-x-2 py-3"
                  onClick={() => setAnchor(dayjs().startOf('day'))}
                >
                  <Icon path={mdiCalendarTodayOutline} size={1} />
                  Today
                </Button>
                <Button
                  buttonType="secondary"
                  buttonSize="normal"
                  className="py-3"
                  onClick={() => setAnchor(prev => prev.add(1, unit))}
                  tooltip={`Next ${unit}`}
                >
                  <Icon path={mdiChevronRight} size={1} />
                </Button>
              </div>
              <div className="flex h-13 grow items-center rounded-lg border border-panel-border bg-panel-background-alt px-4 text-xl font-semibold">
                {rangeLabel}
                {episodesQuery.isFetching && !episodesQuery.isPending && (
                  <Icon path={mdiLoading} size={1} spin className="ml-3 text-panel-text-primary" />
                )}
              </div>
              <div className="flex items-center gap-x-6 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
                <Checkbox
                  id="calendar-include-missing"
                  label="Include Missing"
                  isChecked={includeMissing}
                  onChange={toggleIncludeMissing}
                  labelRight
                />
                <Checkbox
                  id="calendar-include-restricted"
                  label="Include Restricted"
                  isChecked={includeRestricted}
                  onChange={toggleIncludeRestricted}
                  labelRight
                />
                <Checkbox
                  id="calendar-only-with-air-time"
                  label="Only With Air Time"
                  isChecked={onlyWithAirTime}
                  onChange={toggleOnlyWithAirTime}
                  labelRight
                />
              </div>
              <div className="flex items-center gap-x-2 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-2">
                {episodeTypeOptions.map(option => (
                  <Button
                    key={option.value}
                    buttonType={episodeTypes.includes(option.value) ? 'primary' : 'secondary'}
                    buttonSize="small"
                    onClick={() => toggleEpisodeType(option.value)}
                    tooltip={`${episodeTypes.includes(option.value) ? 'Hide' : 'Show'} ${option.label.toLowerCase()}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <MultiStateButton activeState={view} states={viewStates} onStateChange={handleViewChange} />
            </div>
          </ShokoPanel>
        </div>

        <div className="flex grow flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-background px-4 py-6">
          {episodesQuery.isPending && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} size={4} spin />
            </div>
          )}

          {!episodesQuery.isPending && (
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-7 gap-2">
                {weekdayNames.map(name => (
                  <div key={name} className="text-center text-sm font-semibold opacity-65">
                    {name}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dateKey = day.format(dateKeyFormat);
                  const isToday = dateKey === today;
                  const isOutsideMonth = view === 'month' && !day.isSame(anchor, 'month');
                  const episodes = episodesByDay[dateKey] ?? [];

                  return (
                    <div
                      key={dateKey}
                      className={cx(
                        'flex flex-col gap-y-1.5 rounded-lg border p-2',
                        view === 'week' ? 'min-h-96' : 'min-h-36',
                        isToday ? 'border-panel-text-primary' : 'border-panel-border',
                        isOutsideMonth ? 'bg-panel-background opacity-50' : 'bg-panel-background-alt',
                      )}
                    >
                      <div
                        className={cx(
                          'flex items-center justify-between text-sm font-semibold',
                          isToday && 'text-panel-text-primary',
                        )}
                      >
                        <span>{day.date() === 1 || view === 'week' ? day.format('MMM D') : day.date()}</span>
                        {episodes.length > 0 && <span className="text-xs opacity-65">{episodes.length}</span>}
                      </div>
                      {episodes.map(episode => <EpisodeCard key={episode.IDs.ID} episode={episode} />)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Calendar;
