import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useOutletContext } from 'react-router';

import PaneState, { PaneMessage } from '@/components/AiringSchedule/PaneState';
import SeasonBrowser from '@/components/AiringSchedule/SeasonBrowser';
import SeasonGrid from '@/components/AiringSchedule/SeasonGrid';
import SeasonSlider from '@/components/AiringSchedule/SeasonSlider';
import TransitionDiv from '@/components/TransitionDiv';

import type { SeasonSummaryType, SeasonYearType } from '@/core/react-query/airing-schedule/types';
import type { SeasonKey, SeasonSectionType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

type Props = {
  browser: { isError: boolean, isPending: boolean, years: SeasonYearType[] };
  isBrowsing: boolean;
  isError: boolean;
  isPending: boolean;
  now: Dayjs;
  onBrowseToggle: () => void;
  onRetry: () => void;
  onSeasonChange: (season: SeasonKey) => void;
  onSeasonPick: (season: SeasonKey) => void;
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
      <PaneMessage title="No anime known for this season.">
        Only anime the server has AniDB data for are listed.
      </PaneMessage>
    );
  }

  return <SeasonGrid sections={sections} now={now} showCollectionBadge={showCollectionBadge} />;
};

/** Scrolls the page to the top as it mounts, which a pane keyed by what it shows does as that changes. */
const ScrollToTop = () => {
  const { scrollRef } = useOutletContext<{ scrollRef: RefObject<HTMLDivElement | null> }>();
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [scrollRef]);
  return null;
};

const BrowserPane = (
  { browser, onRetry, onSeasonPick, season }: Pick<Props, 'browser' | 'onRetry' | 'onSeasonPick'> & {
    season: SeasonKey;
  },
) => {
  if (browser.isPending || browser.isError) {
    return <PaneState errorText="Failed to load the seasons." isError={browser.isError} onRetry={onRetry} />;
  }
  return <SeasonBrowser years={browser.years} season={season} onSeasonSelect={onSeasonPick} />;
};

const SeasonView = (
  { browser, isBrowsing, onBrowseToggle, onSeasonChange, onSeasonPick, season, seasons, ...pane }: Props,
) => {
  useHotkeys('escape', onBrowseToggle, { scopes: 'primary', enabled: isBrowsing });

  return (
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
      {/* The browser and the anime differ in height, so each starts at the top. */}
      <TransitionDiv key={isBrowsing ? 'browser' : 'anime'} className="flex grow flex-col">
        <ScrollToTop />
        {isBrowsing && season
          ? <BrowserPane browser={browser} onRetry={pane.onRetry} onSeasonPick={onSeasonPick} season={season} />
          : <SeasonPane {...pane} />}
      </TransitionDiv>
    </div>
  );
};

export default SeasonView;
