import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useFilteredSeriesInfiniteQuery } from '@/core/react-query/filter/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { SeriesType } from '@/core/types/api/series';
import type { TagType } from '@/core/types/api/tags';

const SeriesLink = React.memo(({ extraPadding, series }: { series: SeriesType, extraPadding: boolean }) => (
  <Link
    to={`/webui/collection/series/${series.IDs.ID}`}
    className={cx(
      'flex justify-between align-middle hover:text-panel-text-primary',
      extraPadding && ('pr-4'),
    )}
  >
    <span
      className="line-clamp-1"
      data-tooltip-id="tooltip"
      data-tooltip-content={series.Name}
      data-tooltip-delay-show={500}
    >
      {series.Name}
    </span>
    <Icon path={mdiOpenInNew} size={1} className="shrink-0" />
  </Link>
));

const SeriesVirtualizer = ({ data }: { data: SeriesType[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    getItemKey: idx => data[idx].IDs.ID,
    estimateSize: () => (25.6), // Standard line height
    gap: 8,
    overscan: 3,
  });

  return (
    <div className="shoko-scrollbar max-h-[12.5rem] overflow-y-auto" ref={scrollRef}>
      <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(({ index, key, size, start }) => (
          <div
            key={key}
            className="absolute left-0 top-0 w-full"
            style={{ height: size, transform: `translateY(${start}px)` }}
          >
            <SeriesLink series={data[index]} extraPadding={data.length > 6} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TagDetailsModal = ({ onClose, show, tag }: { show: boolean, tag?: TagType, onClose: () => void }) => {
  const { data: seriesDataList, fetchNextPage, isFetchingNextPage, isSuccess } = useFilteredSeriesInfiniteQuery(
    {
      pageSize: 50,
      filterCriteria: {
        ApplyAtSeriesLevel: true,
        Expression: {
          Parameter: tag?.Name ?? '',
          Type: tag?.Source === 'User' ? 'HasCustomTag' : 'HasTag',
        },
      },
    },
    show,
  );
  const [seriesData, seriesCount] = useFlattenListResult(seriesDataList);

  if (!isFetchingNextPage && seriesData.length !== seriesCount) {
    fetchNextPage().catch(() => {});
  }

  const header = (
    <div className="flex w-full justify-between capitalize">
      <div>
        Tag |&nbsp;
        {tag?.Name}
      </div>
      {tag?.Source === 'AniDB' && (
        <a
          href={`https://anidb.net/tag/${tag.ID}`}
          className=" flex items-center gap-x-2 text-base text-panel-icon-action"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="metadata-link-icon AniDB" />
          AniDB (
          {tag?.ID}
          )
          <Icon path={mdiOpenInNew} size={1} />
        </a>
      )}
    </div>
  );

  return (
    <ModalPanel show={show} onRequestClose={onClose} header={header} size="sm">
      <AnidbDescription
        text={tag?.Description?.trim() ? tag.Description : 'Tag Description Not Available.'}
        className="shoko-scrollbar max-h-62.5 overflow-y-auto pr-4 opacity-65"
      />
      {isSuccess && seriesCount > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-base font-bold">
            Series With Tag |&nbsp;
            <span className="text-panel-text-important">
              {seriesCount}
            </span>
            &nbsp;Series
          </div>
          <div className="grow rounded-lg bg-panel-input p-6">
            <SeriesVirtualizer data={seriesData} />
          </div>
        </div>
      )}
    </ModalPanel>
  );
};

export default TagDetailsModal;
