import React, { useMemo } from 'react';
import type { PlacesType } from 'react-tooltip';
import { mdiArrowRightThinCircleOutline, mdiLoading, mdiStarCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import cx from 'classnames';

import { useCreateGroupMutation, usePatchGroupMutation } from '@/core/react-query/group/mutations';
import { useGroupQuery, useGroupSeriesQuery } from '@/core/react-query/group/queries';
import { invalidateQueries } from '@/core/react-query/queryClient';

type Props = {
  groupId: number;
};

const SeriesTab = React.memo(({ groupId }: Props) => {
  const {
    data: groupData,
    isError: groupError,
    isPending: groupPending,
    isSuccess: groupSuccess,
  } = useGroupQuery(groupId);
  const {
    data: seriesData,
    isError: seriesError,
    isPending: seriesPending,
    isSuccess: seriesSuccess,
  } = useGroupSeriesQuery(groupId);

  const sortedSeriesData = useMemo(
    () => seriesData?.sort((seriesA, seriesB) => (seriesA.IDs.ID > seriesB.IDs.ID ? 1 : -1)),
    [seriesData],
  );

  const { mutate: moveToNewGroupMutation } = useCreateGroupMutation();
  const { mutate: setGroupMainSeriesMutation } = usePatchGroupMutation();

  const moveSeriesToNewGroup = (seriesId: number) => {
    moveToNewGroupMutation(seriesId, {
      onSuccess: () => {
        invalidateQueries(['group', groupId]);
        invalidateQueries(['group-series', groupId]);
      },
    });
  };

  const setMainSeries = (seriesId: number) => {
    if (groupData!.IDs.MainSeries !== seriesId) {
      setGroupMainSeriesMutation({
        groupId,
        seriesId,
        operations: [{ op: 'replace', path: 'PreferredSeriesID', value: seriesId }],
      }, {
        onSuccess: () => {
          invalidateQueries(['group', groupId]);
          invalidateQueries(['group-series', groupId]);
        },
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex overflow-y-auto rounded-lg border border-panel-border bg-panel-input p-6">
        <div
          className={cx(
            'flex grow flex-col gap-y-2 overflow-y-auto bg-panel-input',
            (seriesSuccess && seriesData.length > 9) && 'pr-4',
          )}
        >
          {(seriesPending || groupPending) && (
            <Icon
              path={mdiLoading}
              size={3}
              className="my-auto self-center text-panel-text-primary"
              spin
            />
          )}
          {(seriesError || groupError) && (
            <span className="my-auto self-center text-panel-text-danger">Error, please refresh!</span>
          )}
          {(seriesSuccess && groupSuccess) && sortedSeriesData?.map((series) => {
            const isMainSeries = series.IDs.ID === groupData?.IDs.MainSeries;

            const baseTooltipAttribs = {
              'data-tooltip-id': 'tooltip',
              'data-tooltip-place': 'top' as PlacesType,
              'data-tooltip-delay-show': 500,
            };
            const mainSeriesTooltip = isMainSeries
              ? {}
              : { ...baseTooltipAttribs, 'data-tooltip-content': 'Set as main series' };
            const moveToNewGroupTooltip = { ...baseTooltipAttribs, 'data-tooltip-content': 'Move series to new group' };

            return (
              <div
                className="flex justify-between gap-x-2 last:border-none hover:text-panel-text-primary"
                key={series.IDs.ID}
              >
                <div className="grow select-none">{series.Name}</div>
                <div
                  className={cx(
                    'shrink-0',
                    isMainSeries ? 'text-panel-icon-warning opacity-65' : 'text-panel-icon-action cursor-pointer',
                  )}
                  {...mainSeriesTooltip}
                  onClick={() => setMainSeries(series.IDs.ID)}
                >
                  <Icon path={mdiStarCircleOutline} size={1} />
                </div>
                <div
                  className="shrink-0 cursor-pointer text-panel-icon-action"
                  {...moveToNewGroupTooltip}
                  onClick={() => moveSeriesToNewGroup(series.IDs.ID)}
                >
                  <Icon path={mdiArrowRightThinCircleOutline} size={1} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SeriesTab;
