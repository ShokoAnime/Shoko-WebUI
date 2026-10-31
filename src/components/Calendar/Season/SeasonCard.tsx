import { startCase } from 'lodash';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import { Badge } from '@/components/Badge';
import SeasonCardAiring from '@/components/Calendar/Season/SeasonCardAiring';
import SeriesLink from '@/components/Calendar/SeriesLink';
import CleanDescription from '@/components/Collection/CleanDescription';
import { convertTimeSpanToMs } from '@/core/util';

import type { SeasonAnimeType } from '@/core/types/api/airing-season';
import type { Dayjs } from '@/core/util';

type Props = {
  anime: SeasonAnimeType;
  now: Dayjs;
  showCollectionBadge: boolean;
};

const CollectionBadge = ({ anime, showCollectionBadge }: Pick<Props, 'anime' | 'showCollectionBadge'>) => {
  if (!anime.ShokoID) return null;
  if (anime.VideoCount === 0) {
    return <Badge className="shrink-0 self-start bg-panel-text-warning text-button-primary-text">Missing Files</Badge>;
  }
  if (!showCollectionBadge) return null;
  return <Badge className="shrink-0 self-start bg-panel-text-important text-button-primary-text">In Collection</Badge>;
};

const SeasonCard = ({ anime, now, showCollectionBadge }: Props) => {
  const studios = anime.Studios.map(studio => studio.Name).join(', ');
  const source = anime.SourceMaterial && anime.SourceMaterial !== 'Unknown' ? startCase(anime.SourceMaterial) : null;
  // The next episode's own length, else the anime's usual one.
  const duration = anime.NextAiring?.Duration ?? anime.EpisodeDuration;
  const minutes = duration ? Math.round(convertTimeSpanToMs(duration) / 60_000) : 0;
  const details = [
    source && `Source · ${source}`,
    anime.EpisodeCount ? `${anime.EpisodeCount} ${anime.EpisodeCount === 1 ? 'Episode' : 'Episodes'}` : null,
    minutes ? `${minutes} ${minutes === 1 ? 'min' : 'mins'}` : null,
  ].filter(Boolean).join(' | ');

  return (
    <div className="@container flex h-64 overflow-hidden rounded-lg border border-panel-border bg-panel-background-alt">
      <SeriesLink anidbId={anime.ID} shokoId={anime.ShokoID} className="group relative isolate w-28 shrink-0 @sm:w-44">
        {/* A missing poster leaves the frame empty, so the notice does not cover the title. */}
        {anime.Poster?.Available
          ? <BackgroundImagePlaceholderDiv image={anime.Poster} className="size-full" zoomOnHover />
          : <div className="size-full bg-panel-input" />}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-y-1 bg-panel-background-overlay p-3">
          <span
            className="line-clamp-2 text-sm font-semibold"
            data-tooltip-id="tooltip"
            data-tooltip-content={anime.Title}
            data-tooltip-delay-show={500}
          >
            {anime.Title}
          </span>
          {studios && <span className="truncate text-xs text-panel-text-primary">{studios}</span>}
        </div>
      </SeriesLink>

      <div className="flex min-w-0 grow flex-col gap-y-2 p-3 @sm:p-4">
        <div className="flex flex-col-reverse gap-1 @sm:flex-row @sm:items-start @sm:justify-between">
          <SeasonCardAiring anime={anime} now={now} />
          <CollectionBadge anime={anime} showCollectionBadge={showCollectionBadge} />
        </div>
        {details && <span className="text-sm opacity-65">{details}</span>}
        <CleanDescription
          className="line-clamp-3 pr-0! text-sm! opacity-85 @sm:line-clamp-4"
          text={anime.Overview ?? ''}
        />
        {anime.Tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1">
            {anime.Tags.map(tag => (
              <Badge key={`${tag.Source}-${tag.ID}`} className="bg-panel-tags capitalize">{tag.Name}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonCard;
