import { useState } from 'react';
import { mdiMagnify } from '@mdi/js';
import { sortBy } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import { useMergeAiringChannelsMutation } from '@/core/react-query/airing-schedule/mutations';
import toast from '@/core/toast';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';
import useSyncedState from '@/hooks/useSyncedState';

import type { AiringChannelType } from '@/core/types/api/airing-schedule';

type Props = {
  /** The channel to merge away; the modal is shown while it is set. */
  source: AiringChannelType | null;
  channels: AiringChannelType[];
  onClose: () => void;
};

/**
 * Merges a channel into another of the same type, picked from a searchable list, through
 * `POST AiringSchedule/Channel/{channelID}/Merge`. The picked channel stays; the merged one's name becomes its alias.
 */
const AiringChannelMergeModal = ({ channels, onClose, source: openedSource }: Props) => {
  // The last channel opened, so the modal keeps its content while it closes.
  const [source] = useSyncedState(openedSource, (next, prev) => next ?? prev ?? null);
  const [search, setSearch] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const { isPending, mutate: mergeChannels } = useMergeAiringChannelsMutation();

  const query = search.trim().toLowerCase();
  const offered = sortBy(
    channels.filter(channel => source && channel.Type === source.Type && channel.ID !== source.ID),
    channel => channel.Name.toLowerCase(),
  );
  const shown = offered.filter(channel =>
    matchesChannelSearch(query, [channel.Name, ...channel.Aliases], channel.CountryCode ?? null)
  );
  const target = offered.find(channel => channel.ID === targetId);

  const handleClose = () => {
    if (isPending) return;
    setSearch('');
    setTargetId(null);
    onClose();
  };

  const handleMerge = () => {
    if (!source || !target) return;
    mergeChannels({ channelId: target.ID, sourceIds: [source.ID] }, {
      onSuccess: () => {
        toast.success('Channels merged!', `${source.Name} is now an alias of ${target.Name}.`);
        setSearch('');
        setTargetId(null);
        onClose();
      },
    });
  };

  return (
    <ModalPanel show={!!openedSource} onRequestClose={handleClose} header="Merge Channel" size="md">
      <div>
        {'Pick the channel to keep, then merge '}
        <span className="font-semibold">{source?.Name}</span>
        {` into it. Only ${source?.Type.toLowerCase() ?? ''} channels are listed.`}
      </div>
      <Input
        id="airing-channel-merge-search"
        type="text"
        placeholder="Search..."
        startIcon={mdiMagnify}
        value={search}
        onChange={event => setSearch(event.target.value)}
        inputClassName="px-4 py-3"
      />
      <div className="w-full rounded-lg border border-panel-border bg-panel-input p-4">
        <div className="flex h-80 flex-col gap-y-1.5 overflow-y-auto rounded-lg bg-panel-input px-3 py-2">
          {shown.length === 0 && <div className="text-sm opacity-65">No channel matches.</div>}
          {shown.map(channel => (
            <Checkbox
              id={`airing-channel-merge-${channel.ID}`}
              key={channel.ID}
              isChecked={channel.ID === targetId}
              onChange={event => setTargetId(event.target.checked ? channel.ID : null)}
              label={
                <AiringChannelLabel name={channel.Name} countryCode={channel.CountryCode} aliases={channel.Aliases} />
              }
              labelClassName="min-w-0"
              justify
            />
          ))}
        </div>
      </div>
      {source && target && (
        <div className="text-sm text-panel-text-warning">
          {`${source.Name} will become an alias of ${target.Name}, and its schedules will move over to it. The merge `}
          cannot be undone.
        </div>
      )}
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2" disabled={isPending}>
          Discard
        </Button>
        <Button
          onClick={handleMerge}
          buttonType="primary"
          className="px-5 py-2"
          disabled={!target}
          loading={isPending}
        >
          Merge
        </Button>
      </div>
    </ModalPanel>
  );
};

export default AiringChannelMergeModal;
