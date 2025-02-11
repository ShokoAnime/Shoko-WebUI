import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { invalidateQueries } from '@/core/react-query/queryClient';
import { useSetPreferredTmdbShowOrderingMutation } from '@/core/react-query/tmdb/mutations';
import { useTmdbShowOrderingQuery } from '@/core/react-query/tmdb/queries';
import { AlternateOrderingTypeEnum } from '@/core/react-query/tmdb/types';
import useEventCallback from '@/hooks/useEventCallback';

export type Props = {
  onClose: () => void;
  show: boolean;
  showId: number;
};

function orderingToDescription(ordering: AlternateOrderingTypeEnum | undefined): string {
  switch (ordering) {
    case AlternateOrderingTypeEnum.Unknown:
      return ' (Unknown)';
    case AlternateOrderingTypeEnum.OriginalAirDate:
      return ' (Original Air Date)';
    case AlternateOrderingTypeEnum.Absolute:
      return ' (Absolute)';
    case AlternateOrderingTypeEnum.DVD:
      return ' (DVD)';
    case AlternateOrderingTypeEnum.Digital:
      return ' (Digital)';
    case AlternateOrderingTypeEnum.StoryArc:
      return ' (Story Arc)';
    case AlternateOrderingTypeEnum.Production:
      return ' (Production)';
    case AlternateOrderingTypeEnum.TV:
      return ' (TV)';
    default:
      return '';
  }
}

function TmdbShowSettingsModal({ onClose, show, showId }: Props) {
  const orderingQuery = useTmdbShowOrderingQuery(showId, show && showId > 0);
  const { mutate: setOrdering, status: setOrderingStatus } = useSetPreferredTmdbShowOrderingMutation(
    showId,
  );
  const { data: orderingList } = orderingQuery;
  const [selectedOrderingId, setSelectedOrderingId] = useState<string>('');
  const selectedOrdering = useMemo(() => orderingList.find(ordering => ordering.OrderingID === selectedOrderingId), [
    orderingList,
    selectedOrderingId,
  ]);

  const canSave = setOrderingStatus !== 'pending' && selectedOrdering != null && !selectedOrdering.InUse;

  const handleClose = useEventCallback(() => {
    setSelectedOrderingId('');
    invalidateQueries(['series', 'tmdb', 'show']);
    invalidateQueries(['series', 'tmdb', 'episode', 'bulk']);
    onClose();
  });

  const handleOrderingClick = useEventCallback((event: React.MouseEvent<HTMLElement>) => {
    const { orderingId } = event.currentTarget.dataset;
    if (!orderingId) return;

    const ordering = orderingList.find(ord => ord.OrderingID === orderingId);
    if (!ordering || ordering.InUse) return;

    if (selectedOrderingId === orderingId) {
      setSelectedOrderingId('');
    } else {
      setSelectedOrderingId(orderingId);
    }
  });

  const handleSave = useEventCallback(() => {
    if (!selectedOrderingId) return;
    setOrdering(selectedOrderingId, {
      onSuccess: () => {
        toast.success('Ordering has been updated!');
      },
      onError: () => {
        toast.error('Failed to update ordering!');
      },
    });
  });

  useEffect(() => {
    if (selectedOrdering?.InUse ?? false) {
      setSelectedOrderingId('');
    }
  }, [selectedOrdering]);

  useLayoutEffect(() => {
    if (show) {
      orderingQuery.refetch().catch(console.error);
    }
  }, [show, showId, orderingQuery]);

  return (
    <ModalPanel
      show={show}
      onRequestClose={handleClose}
      header="TMDb Show Settings"
      size="sm"
      overlayClassName="!z-[90]"
    >
      <div className="flex grow flex-col gap-y-2">
        <div className="mb-2 flex justify-between font-semibold">
          Ordering
        </div>
        <div className="flex h-[10.5rem] flex-col overflow-y-auto rounded-md border border-panel-border bg-panel-background-alt px-4 py-2 contain-strict">
          {orderingList.map(ordering => (
            <div
              key={ordering.OrderingID}
              data-ordering-id={ordering.OrderingID}
              onClick={handleOrderingClick}
              className={cx(
                'flex flex-row justify-between transition-colors',
                !ordering.InUse && 'cursor-pointer',
                ordering.InUse && (!selectedOrdering || selectedOrdering.OrderingID !== ordering.OrderingID)
                  && 'text-panel-text-primary',
                selectedOrdering?.OrderingID === ordering.OrderingID && 'text-panel-text-important',
              )}
            >
              <span>
                {`${ordering.OrderingName}${orderingToDescription(ordering.OrderingType)}`}
              </span>
              <span className="w-10 text-center">
                {`${ordering.EpisodeCount}${
                  ordering.HiddenEpisodeCount > 0 ? `(+${ordering.HiddenEpisodeCount})` : ''
                }`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-6 py-2">Close</Button>
        <Button onClick={handleSave} buttonType="primary" disabled={!canSave} className="px-6 py-2">Save</Button>
      </div>
    </ModalPanel>
  );
}

export default TmdbShowSettingsModal;
