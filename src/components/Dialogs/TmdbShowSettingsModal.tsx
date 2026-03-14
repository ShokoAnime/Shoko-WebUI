import React, { useEffect, useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useSetPreferredTmdbShowOrderingMutation } from '@/core/react-query/tmdb/mutations';
import { useTmdbShowOrderingQuery } from '@/core/react-query/tmdb/queries';
import { AlternateOrderingTypeEnum } from '@/core/react-query/tmdb/types';

type Props = {
  onClose: () => void;
  show: boolean;
  showId: number;
};

const orderingDescriptionMap = {
  [AlternateOrderingTypeEnum.Unknown]: ' (Unknown)',
  [AlternateOrderingTypeEnum.OriginalAirDate]: ' (Original Air Date)',
  [AlternateOrderingTypeEnum.Absolute]: ' (Absolute)',
  [AlternateOrderingTypeEnum.DVD]: ' (DVD)',
  [AlternateOrderingTypeEnum.Digital]: ' (Digital)',
  [AlternateOrderingTypeEnum.StoryArc]: ' (Story Arc)',
  [AlternateOrderingTypeEnum.Production]: ' (Production)',
  [AlternateOrderingTypeEnum.TV]: ' (TV)',
  default: '',
} as const;

const TmdbShowSettingsModal = ({ onClose, show, showId }: Props) => {
  const orderingQuery = useTmdbShowOrderingQuery(showId, show && showId > 0);

  const { isPending: setOrderingPending, mutate: setOrdering } = useSetPreferredTmdbShowOrderingMutation(showId);

  const [inUseOrdering, setInUseOrdering] = useState('');
  const [selectedOrdering, setSelectedOrdering] = useState('');
  useEffect(() => {
    if (!orderingQuery.data) return;
    const initialOrdering = orderingQuery.data.find(ordering => ordering.InUse);
    if (!initialOrdering) return;
    setSelectedOrdering(initialOrdering.OrderingID);
    setInUseOrdering(initialOrdering.OrderingID);
  }, [orderingQuery.data]);

  const handleSave = () => {
    if (!selectedOrdering) return;
    setOrdering(selectedOrdering, {
      onSuccess: () => {
        toast.success('Ordering has been updated!');
        onClose();
      },
      onError: () => {
        toast.error('Failed to update ordering!');
      },
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      header="TMDB Show Settings"
      size="sm"
      overlayClassName="!z-[90]"
    >
      <div className="flex grow flex-col gap-y-2">
        <div className="flex justify-between font-semibold">
          Ordering
        </div>

        <div className="h-60 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2">
          {orderingQuery.data
            ? (
              <div className="flex flex-col grow overflow-y-auto gap-y-2 h-full">
                {orderingQuery.data.map(ordering => (
                  <div
                    key={ordering.OrderingID}
                    onClick={() => setSelectedOrdering(ordering.OrderingID)}
                    className={cx(
                      'flex justify-between transition-colors cursor-pointer',
                      selectedOrdering === ordering.OrderingID && 'text-panel-text-primary',
                    )}
                  >
                    {`${ordering.OrderingName}${orderingDescriptionMap[ordering.OrderingType ?? 'default']}`}
                    <div className="w-10 text-center">
                      {`${ordering.EpisodeCount}${
                        ordering.HiddenEpisodeCount > 0 ? `(+${ordering.HiddenEpisodeCount})` : ''
                      }`}
                    </div>
                  </div>
                ))}
              </div>
            )
            : (
              <div className="flex grow items-center justify-center h-full">
                <Icon path={mdiLoading} size={3} spin className="text-panel-text-primary" />
              </div>
            )}
        </div>
      </div>

      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" buttonSize="normal">Close</Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          buttonSize="normal"
          loading={setOrderingPending}
          disabled={selectedOrdering === inUseOrdering}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default TmdbShowSettingsModal;
