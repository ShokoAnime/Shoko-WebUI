import React from 'react';
import { Link } from 'react-router-dom';
import { mdiOpenInNew } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import AnidbDescription from '@/components/Collection/AnidbDescription';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useFilteredSeriesInfiniteQuery } from '@/core/react-query/filter/queries';
import useFlattenListResult from '@/hooks/useFlattenListResult';

import type { TagType } from '@/core/types/api/tags';

const TagDetailsModal = React.memo(({ onClose, show, tag }: { show: boolean, tag?: TagType, onClose: () => void }) => {
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

  // TODO: Virtualize rows

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
          <div className="w-full rounded-lg bg-panel-input p-6">
            <div className="shoko-scrollbar flex max-h-[12.5rem] flex-col gap-y-2 overflow-y-auto bg-panel-input">
              {seriesData?.map(series => (
                <Link
                  to={`/webui/collection/series/${series.IDs.ID}`}
                  key={series.IDs.ID}
                  className={cx(
                    'flex justify-between align-middle hover:text-panel-text-primary',
                    seriesData.length > 6 && ('pr-4'),
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
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalPanel>
  );
});

export default TagDetailsModal;
