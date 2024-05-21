import React from 'react';
import { mdiOpenInNew } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { dayjs } from '@/core/util';

import type { WebuiSeriesFileSummaryMissingEpisodeType } from '@/core/types/api/webui';

type FileMissingEpisodeProps = {
  episode: WebuiSeriesFileSummaryMissingEpisodeType;
  rowId: number;
};
const MissingEpisode = ({ episode, rowId }: FileMissingEpisodeProps) => (
  <div
    className={cx(
      'flex p-4 gap-16 rounded-lg border text-left transition-colors border-panel-border items-center',
      rowId % 2 === 0 ? 'bg-panel-background' : 'bg-panel-background-alt',
    )}
  >
    <div className="w-[12.5rem]">
      {episode.Type}
      &nbsp;
      {episode.EpisodeNumber.toString().padStart(2, '0')}
    </div>
    <div className="flex w-[46.875rem] flex-row">
      {episode.Titles.find(e => e.Language === 'en')?.Name ?? '--'}
      &nbsp;
      <a
        className="inline-flex items-center gap-0 text-panel-text-primary"
        href={`https://anidb.net/episode/${episode.ID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="text-panel-text">(</span>
        {episode.ID}
        <span className="text-panel-text">)</span>
        &nbsp;
        <Icon className="text-panel-text-primary" path={mdiOpenInNew} size={1} />
      </a>
    </div>
    <div>
      {dayjs(episode.AirDate).format('MMMM DD YYYY')}
    </div>
  </div>
);

type Props = {
  missingEps?: WebuiSeriesFileSummaryMissingEpisodeType[];
};
const FileMissingEpisodes = ({ missingEps = [] }: Props) => (
  missingEps.length === 0
    ? (
      <div className="flex h-full flex-col justify-center rounded-lg border border-panel-border bg-panel-background-transparent p-6 text-center font-semibold transition-colors">
        <div>You have no missing episodes or specials. Well done!</div>
      </div>
    )
    : (
      <div className="flex max-h-[72vh] flex-col rounded-lg border border-panel-border bg-panel-background-transparent p-6 transition-colors">
        <div className="sticky top-0 z-[1] flex bg-panel-background-alt">
          <div className="mb-1 flex grow items-center gap-16 rounded-lg border border-panel-border bg-panel-table-header p-4 text-left font-semibold transition-colors">
            <div className="w-[12.5rem] text-left">
              Type
            </div>
            <div className="w-[46.875rem] text-left">
              Title
            </div>
            <div className="w-[139px] text-left">
              Airing Date
            </div>
          </div>
        </div>
        <div className="flex w-full grow-0 flex-col gap-y-1 overflow-auto overscroll-contain">
          {missingEps.map((episode, rowId) => <MissingEpisode episode={episode} key={episode.ID} rowId={rowId} />)}
        </div>
      </div>
    )
);

export default FileMissingEpisodes;
