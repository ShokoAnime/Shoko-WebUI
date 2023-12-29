import React, { useMemo } from 'react';
import { groupBy } from 'lodash';
import prettyBytes from 'pretty-bytes';

import type { FileType } from '@/core/types/api/file';

type Props = {
  title?: string;
  items: FileType[];
};

const FilesSummary = ({ items, title }: Props) => {
  const { episodeCount, seriesCount, totalSize } = useMemo(() => {
    if (items.length === 0) {
      return {
        seriesCount: 0,
        totalSize: 0,
        episodeCount: 0,
      };
    }

    const selectedSeriesCount = Object.keys(
      groupBy(items.flatMap(x => x.SeriesIDs).map(x => x?.SeriesID), x => x?.ID),
    ).length;
    const selectedSize = items.reduce((prev, cur) => prev + cur.Size, 0);
    const selectedEpisodeCount = items.flatMap(x => x.SeriesIDs).map(x => x?.EpisodeIDs.flatMap(z => z.ID)).length;
    return {
      seriesCount: selectedSeriesCount,
      totalSize: selectedSize,
      episodeCount: selectedEpisodeCount,
    };
  }, [items]);

  return (
    <>
      <div className="mb-8 flex w-full text-xl font-semibold">{title ?? 'Files Summary'}</div>
      <div className="flex justify-between capitalize">
        <span className="font-semibold">Series Count</span>
        <span>{seriesCount}</span>
      </div>
      <div className="flex justify-between capitalize">
        <span className="font-semibold">Episode Count</span>
        <span>{episodeCount}</span>
      </div>
      <div className="flex justify-between capitalize">
        <span className="font-semibold">Total Size</span>
        <span>{prettyBytes(totalSize, { binary: true })}</span>
      </div>
    </>
  );
};

export default FilesSummary;
