import { useState } from 'react';
import { mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isEqual } from 'lodash';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import { useUpdateAiringChannelAliasesMutation } from '@/core/react-query/airing-schedule/mutations';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';

import type { AiringChannelType } from '@/core/types/api/airing-schedule';

type Props = {
  /** The channel whose aliases are edited; the modal is shown while it is set. */
  channel: AiringChannelType | null;
  onClose: () => void;
};

/** Lists a channel's aliases to add to and remove from, saved together through `PUT AiringSchedule/Channel/{id}/Aliases`. */
const AiringChannelAliasesModal = ({ channel: openedChannel, onClose }: Props) => {
  const [newAlias, setNewAlias] = useState('');
  // The last channel opened, so the modal keeps its content while it closes.
  const [channel] = useSyncedState(openedChannel, (next, prev) => next ?? prev ?? null);
  // Starts over from the channel's aliases each time the modal opens, and keeps them while it closes.
  const [aliases, setAliases] = useSyncedState(openedChannel, (next, prev: string[] = []) => next?.Aliases ?? prev);
  const { isPending, mutate: updateAliases } = useUpdateAiringChannelAliasesMutation();

  const trimmed = newAlias.trim();
  // The name and the listed aliases, ignoring case, are already the channel's.
  const isKnown = [channel?.Name ?? '', ...aliases].some(name => name.toLowerCase() === trimmed.toLowerCase());
  const isEdited = !!channel && !isEqual(aliases, channel.Aliases);

  const handleAdd = () => {
    if (!trimmed || isKnown) return;
    setAliases([...aliases, trimmed]);
    setNewAlias('');
  };

  const handleClose = () => {
    if (isPending) return;
    setNewAlias('');
    onClose();
  };

  const handleSave = () => {
    if (!channel) return;
    updateAliases({ channelId: channel.ID, aliases }, {
      onSuccess: () => {
        toast.success('Aliases saved!');
        setNewAlias('');
        onClose();
      },
    });
  };

  return (
    <ModalPanel show={!!openedChannel} onRequestClose={handleClose} header="Channel Aliases" size="sm">
      {channel && (
        <div className="flex flex-col gap-y-1">
          <AiringChannelLabel name={channel.Name} countryCode={channel.CountryCode} type={channel.Type} />
          <div className="text-sm opacity-65">
            Other names the channel goes by. The channel searches match them too.
          </div>
        </div>
      )}
      <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {aliases.length === 0 && <div className="py-1 text-sm opacity-65">No aliases.</div>}
        {aliases.map(alias => (
          <div key={alias} className="flex items-center justify-between py-1">
            <span className="truncate">{alias}</span>
            <Button onClick={() => setAliases(aliases.filter(item => item !== alias))} tooltip="Remove">
              <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-x-2">
        <Input
          id="airing-channel-alias-new"
          type="text"
          placeholder="New alias..."
          value={newAlias}
          onChange={event => setNewAlias(event.target.value)}
          onKeyUp={event => event.key === 'Enter' && handleAdd()}
          className="grow"
        />
        <Button onClick={handleAdd} tooltip="Add Alias" disabled={!trimmed || isKnown}>
          <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
        </Button>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2" disabled={isPending}>
          Discard
        </Button>
        <Button
          onClick={handleSave}
          buttonType="primary"
          className="px-5 py-2"
          disabled={!isEdited}
          loading={isPending}
        >
          Save
        </Button>
      </div>
    </ModalPanel>
  );
};

export default AiringChannelAliasesModal;
