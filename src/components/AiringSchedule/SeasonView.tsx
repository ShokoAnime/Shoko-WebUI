import PaneState from '@/components/AiringSchedule/PaneState';
import SeasonGrid from '@/components/AiringSchedule/SeasonGrid';

import type { SeasonSectionType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

type Props = {
  isError: boolean;
  isPending: boolean;
  now: Dayjs;
  onRetry: () => void;
  sections: SeasonSectionType[];
  showCollectionBadge: boolean;
};

const SeasonView = ({ isError, isPending, now, onRetry, sections, showCollectionBadge }: Props) => {
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

export default SeasonView;
