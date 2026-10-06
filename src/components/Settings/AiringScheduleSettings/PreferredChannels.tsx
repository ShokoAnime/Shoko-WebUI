import { useState } from 'react';

import AiringChannelsModal from '@/components/Dialogs/AiringChannelsModal';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import OrderList from '@/components/Settings/OrderList';

import type { AiringChannelType } from '@/core/types/api/airing-schedule';

type Props = {
  channels: AiringChannelType[];
  channelIds: string[];
  onChange: (channelIds: string[]) => void;
};

/** The server's preferred channels, best first, laid out like the language order lists. Empty means no preference. */
const PreferredChannels = ({ channelIds, channels, onChange }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const channelMap = new Map(channels.map(channel => [channel.ID, channel]));

  return (
    <>
      <OrderList
        label="Preferred Channels"
        items={channelIds.map(channelId => ({
          key: channelId,
          content: (
            <AiringChannelLabel
              name={channelMap.get(channelId)?.Name ?? channelId}
              countryCode={channelMap.get(channelId)?.CountryCode}
              type={channelMap.get(channelId)?.Type}
            />
          ),
        }))}
        onOrderChange={onChange}
        onAdd={() => setShowModal(true)}
        addTooltip="Add Channels"
        emptyStateMessage="No channel preference set. Every channel counts the same."
      />
      <AiringChannelsModal
        show={showModal}
        channels={channels}
        channelIds={channelIds}
        onChange={onChange}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default PreferredChannels;
