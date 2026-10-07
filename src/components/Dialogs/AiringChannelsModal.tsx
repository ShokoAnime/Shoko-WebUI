import { useState } from 'react';
import { mdiMagnify } from '@mdi/js';
import { sortBy } from 'lodash';

import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';
import useSyncedState from '@/hooks/useSyncedState';

import type { AiringChannelKindType, AiringChannelType } from '@/core/types/api/airing-schedule';

/** A channel as the modal offers it: its name first, then its aliases, which the search matches too, as its country. */
type OfferedChannel = {
  id: string;
  names: string[];
  countryCode: string | null;
  type: AiringChannelKindType | null;
};

type Props = {
  show: boolean;
  channels: AiringChannelType[];
  /** The channels already listed, in order. */
  channelIds: string[];
  /** Takes the listed channels still ticked, in their place, then the newly ticked ones in the order shown. */
  onChange: (channelIds: string[]) => void;
  onClose: () => void;
};

/** Picks the preferred channels from every known channel, by name, the listed ones ticked. */
const AiringChannelsModal = ({ channelIds, channels, onChange, onClose, show }: Props) => {
  const [search, setSearch] = useState('');
  // Compared by value, as the caller may build the list anew on every render.
  const [picked, setPicked] = useSyncedState<string | null, string[]>(
    show ? channelIds.join('\n') : null,
    source => (source ? source.split('\n') : []),
  );

  // A listed channel the registry no longer has is offered under its ID, so it can be removed.
  const offered: OfferedChannel[] = [
    ...sortBy(channels, channel => channel.Name.toLowerCase()).map(channel => ({
      id: channel.ID,
      names: [channel.Name, ...channel.Aliases],
      countryCode: channel.CountryCode ?? null,
      type: channel.Type,
    })),
    ...channelIds
      .filter(channelId => !channels.some(channel => channel.ID === channelId))
      .map(channelId => ({ id: channelId, names: [channelId], countryCode: null, type: null })),
  ];

  const query = search.trim().toLowerCase();
  const shown = offered.filter(channel => matchesChannelSearch(query, channel.names, channel.countryCode));

  const handleChange = (channelId: string, checked: boolean) => {
    const rest = picked.filter(item => item !== channelId);
    setPicked(checked ? [...rest, channelId] : rest);
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSave = () => {
    const kept = channelIds.filter(channelId => picked.includes(channelId));
    const added = offered
      .filter(channel => picked.includes(channel.id) && !channelIds.includes(channel.id))
      .map(channel => channel.id);
    onChange([...kept, ...added]);
    handleClose();
  };

  return (
    <ModalPanel show={show} onRequestClose={handleClose} header="Preferred Channels" size="md">
      <Input
        id="airing-channel-modal-search"
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
              id={`airing-channel-pick-${channel.id}`}
              key={channel.id}
              isChecked={picked.includes(channel.id)}
              onChange={event => handleChange(channel.id, event.target.checked)}
              label={
                <AiringChannelLabel name={channel.names[0]} countryCode={channel.countryCode} type={channel.type} />
              }
              justify
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2">Discard</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2">Save</Button>
      </div>
    </ModalPanel>
  );
};

export default AiringChannelsModal;
