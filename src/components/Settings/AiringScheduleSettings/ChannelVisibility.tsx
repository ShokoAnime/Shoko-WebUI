import { useState } from 'react';
import { mdiCallMerge, mdiMagnify, mdiTagMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { sortBy } from 'lodash';

import AiringChannelAliasesModal from '@/components/Dialogs/AiringChannelAliasesModal';
import AiringChannelMergeModal from '@/components/Dialogs/AiringChannelMergeModal';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import Input from '@/components/Input/Input';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import { matchesChannelSearch } from '@/core/utilities/airingChannels';

import type { AiringChannelType } from '@/core/types/api/airing-schedule';

type Props = {
  channels: AiringChannelType[];
  /** The hidden channels' IDs. */
  hiddenIds: string[];
  onChange: (hiddenIds: string[]) => void;
  /** Offers each channel's aliases and a merge into another channel, both saved at once. */
  isAdmin: boolean;
};

/**
 * Every known channel with a switch to show or hide its airings, which the server then leaves out of the airing
 * schedule.
 */
const ChannelVisibility = ({ channels, hiddenIds, isAdmin, onChange }: Props) => {
  const [search, setSearch] = useState('');
  const [aliasChannel, setAliasChannel] = useState<AiringChannelType | null>(null);
  const [mergeSource, setMergeSource] = useState<AiringChannelType | null>(null);
  const query = search.trim().toLowerCase();
  const shown = sortBy(channels, channel => channel.Name.toLowerCase()).filter(channel =>
    matchesChannelSearch(query, [channel.Name, ...channel.Aliases], channel.CountryCode ?? null)
  );

  const handleToggle = (channelId: string, visible: boolean) =>
    onChange(visible ? hiddenIds.filter(id => id !== channelId) : [...hiddenIds, channelId]);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-x-4">
        <div className="flex items-center gap-x-1">
          Channels
          {hiddenIds.length > 0 && <span className="text-xs opacity-65">{`(${hiddenIds.length} Hidden)`}</span>}
        </div>
        <Input
          id="airing-channel-search"
          type="text"
          placeholder="Search..."
          startIcon={mdiMagnify}
          value={search}
          onChange={event => setSearch(event.target.value)}
          className="w-64"
        />
      </div>
      <div className="flex max-h-80 flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {shown.length === 0 && <div className="text-sm opacity-65">No channel matches.</div>}
        {shown.map(channel => (
          <div key={channel.ID} className="flex items-center gap-x-2 py-1">
            <label htmlFor={`airing-channel-visible-${channel.ID}`} className="flex min-w-0 grow cursor-pointer">
              <AiringChannelLabel
                name={channel.Name}
                countryCode={channel.CountryCode}
                type={channel.Type}
                aliases={channel.Aliases}
              />
            </label>
            {isAdmin && (
              <>
                <Button
                  onClick={() => setAliasChannel(channel)}
                  tooltip={channel.Aliases.length > 0 ? `Aliases (${channel.Aliases.length})` : 'Aliases'}
                >
                  <Icon className="text-panel-icon-action" path={mdiTagMultipleOutline} size={1} />
                </Button>
                <Button onClick={() => setMergeSource(channel)} tooltip="Merge into...">
                  <Icon className="text-panel-icon-action" path={mdiCallMerge} size={1} />
                </Button>
              </>
            )}
            <Checkbox
              id={`airing-channel-visible-${channel.ID}`}
              isChecked={!hiddenIds.includes(channel.ID)}
              onChange={event => handleToggle(channel.ID, event.target.checked)}
            />
          </div>
        ))}
      </div>
      {isAdmin && (
        <>
          <AiringChannelAliasesModal channel={aliasChannel} onClose={() => setAliasChannel(null)} />
          <AiringChannelMergeModal channels={channels} source={mergeSource} onClose={() => setMergeSource(null)} />
        </>
      )}
    </div>
  );
};

export default ChannelVisibility;
