import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useSetPreferredMetadataOrderingMutation } from '@/core/react-query/metadata/mutations';
import { useMetadataSeriesOrderingsQuery } from '@/core/react-query/metadata/queries';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';

type Props = {
  onClose: () => void;
  seriesId: string;
  show: boolean;
  source: string;
  sourceName: string;
};

const orderingDescriptionMap = {
  Default: '',
  Unknown: ' (Unknown)',
  OriginalAirDate: ' (Original Air Date)',
  Absolute: ' (Absolute)',
  DVD: ' (DVD)',
  Digital: ' (Digital)',
  StoryArc: ' (Story Arc)',
  Production: ' (Production)',
  TV: ' (TV)',
  User: ' (User)',
} as const;

const MetadataSeriesSettingsModal = ({ onClose, seriesId, show, source, sourceName }: Props) => {
  const orderingQuery = useMetadataSeriesOrderingsQuery(source, seriesId, show);

  const { isPending: setOrderingPending, mutate: setOrdering } = useSetPreferredMetadataOrderingMutation(
    source,
    seriesId,
  );

  const inUseOrdering = orderingQuery.data?.find(ordering => ordering.IsPreferred)?.ID ?? '';
  const [selectedOrdering, setSelectedOrdering] = useSyncedState(
    orderingQuery.data,
    data => data?.find(ordering => ordering.IsPreferred)?.ID ?? '',
  );

  const handleSave = () => {
    const ordering = orderingQuery.data?.find(item => item.ID === selectedOrdering);
    if (!ordering) return;
    // The default ordering is chosen by unsetting the preferred one.
    setOrdering(ordering.IsDefault ? null : ordering.ID, {
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
      header={`${sourceName} Series Settings`}
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
              <div className="flex h-full grow flex-col gap-y-2 overflow-y-auto">
                {orderingQuery.data.map(ordering => (
                  <div
                    key={ordering.ID}
                    onClick={() => setSelectedOrdering(ordering.ID)}
                    className={cx(
                      'flex cursor-pointer justify-between transition-colors',
                      selectedOrdering === ordering.ID && 'text-panel-text-primary',
                    )}
                  >
                    {`${ordering.Name}${orderingDescriptionMap[ordering.Type] ?? ''}`}
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
              <div className="flex h-full grow items-center justify-center">
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

export default MetadataSeriesSettingsModal;
