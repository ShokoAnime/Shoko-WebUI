import React from 'react';
import { groupBy } from 'lodash';
import prettyBytes from 'pretty-bytes';

import type { FileType } from '@/core/types/api/file';

type Props = {
  title?: string;
  items: FileType[];
};

const FilesSummary = ({ items, title }: Props) => {
  const seriesCount = items.length === 0
    ? 0
    : Object.keys(
      groupBy(items.flatMap(file => file.SeriesIDs).map(xref => xref?.SeriesID), seriesIds => seriesIds?.ID),
    ).length;
  const totalSize = items.reduce((prev, current) => prev + current.Size, 0);
  const episodeCount = items
    .flatMap(file => file.SeriesIDs)
    .map(xref => xref?.EpisodeIDs.flatMap(episodeIDs => episodeIDs.ID)).length;

  return (
    <>
      <div className="flex w-full text-xl font-semibold">{title ?? 'Files Summary'}</div>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Series Count</span>
          <span className="font-semibold text-panel-text-important">{seriesCount}</span>
        </div>
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Episode Count</span>
          <span className="font-semibold text-panel-text-important">{episodeCount}</span>
        </div>
        <div className="flex justify-between capitalize">
          <span className="font-semibold">Total Size</span>
          <span className="font-semibold text-panel-text-important">{prettyBytes(totalSize, { binary: true })}</span>
        </div>
      </div>
    </>
  );
};

export default FilesSummary;
