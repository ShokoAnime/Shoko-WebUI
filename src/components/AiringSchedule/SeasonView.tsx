import PaneState from '@/components/AiringSchedule/PaneState';
import SeasonGrid from '@/components/AiringSchedule/SeasonGrid';
import SeasonSlider from '@/components/AiringSchedule/SeasonSlider';

import type { SeasonSummaryType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey, SeasonSectionType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

type Props = {
  isBrowsing: boolean;
  isError: boolean;
  isPending: boolean;
  now: Dayjs;
  onBrowseToggle: () => void;
  onRetry: () => void;
  onSeasonChange: (season: SeasonKey) => void;
  /** The shown season, which is not known until the season under way is. */
  season: SeasonKey | undefined;
  seasons: SeasonSummaryType[];
  sections: SeasonSectionType[];
  showCollectionBadge: boolean;
};

const SeasonPane = (
  { isError, isPending, now, onRetry, sections, showCollectionBadge }: Pick<
    Props,
    'isError' | 'isPending' | 'now' | 'onRetry' | 'sections' | 'showCollectionBadge'
  >,
) => {
  if (isPending || isError) {
    return <PaneState errorText="Failed to load the anime of the season." isError={isError} onRetry={onRetry} />;
  }

  if (sections.every(section => section.Anime.length === 0)) {
    return (
      <div className="m-auto flex flex-col items-center gap-y-2 text-center font-semibold">
        <span>No anime known for this season.</span>
        <span className="opacity-65">Only anime the server has AniDB data for are listed.</span>
      </div>
    );
  }

  return <SeasonGrid sections={sections} now={now} showCollectionBadge={showCollectionBadge} />;
};

const SeasonView = ({ isBrowsing, onBrowseToggle, onSeasonChange, season, seasons, ...pane }: Props) => (
  <div className="flex grow flex-col gap-y-6">
    {season && (
      <div className="sticky -top-6 z-10 -mx-6 -mt-2 bg-panel-background px-6 pt-2 pb-1">
        <SeasonSlider
          isBrowsing={isBrowsing}
          onBrowseToggle={onBrowseToggle}
          onSeasonChange={onSeasonChange}
          season={season}
          seasons={seasons}
        />
      </div>
    )}
    <SeasonPane {...pane} />
  </div>
);

export default SeasonView;
