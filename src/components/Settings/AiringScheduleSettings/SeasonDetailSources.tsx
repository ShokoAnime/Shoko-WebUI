import { useState } from 'react';

import TextSourcesModal from '@/components/Dialogs/TextSourcesModal';
import OrderList from '@/components/Settings/OrderList';
import TextSourceLabel from '@/components/Settings/TextSourceLabel';
import { getTextSourceOrder, getTextSources, isAnidbSource } from '@/core/react-query/metadata/helpers';
import { useMetadataLinkSourcesQuery, useMetadataProvidersQuery } from '@/core/react-query/metadata/queries';

type Props = {
  /**
   * The sources, best first, as the settings have them. AniDB leads when the list leaves it out, so a leading AniDB is
   * saved that way.
   */
  order: string[];
  onChange: (order: string[]) => void;
};

/**
 * The sources whose studios and genres the season view shows, best first. AniDB is always listed, first unless the
 * setting places it, and is reordered but never removed or offered; the rest are picked and removed like the title
 * sources.
 */
const SeasonDetailSources = ({ onChange, order }: Props) => {
  const [showModal, setShowModal] = useState(false);

  // `Metadata/Source` names the sources and has their icons; the providers name the plugins serving them.
  const linkSourcesQuery = useMetadataLinkSourcesQuery();
  const providersQuery = useMetadataProvidersQuery();
  const textSources = getTextSources(linkSourcesQuery.data, providersQuery.data);
  const otherSources = textSources.filter(source => !isAnidbSource(source.source));

  // AniDB keeps the spelling and place the setting gives it, and goes first when the setting has none.
  const anidbIndex = order.findIndex(isAnidbSource);
  const sources = anidbIndex === -1
    ? ['anidb', ...order]
    : order.filter((source, index) => index === anidbIndex || !isAnidbSource(source));
  const anidb = sources.find(isAnidbSource)!;
  const others = sources.filter(source => !isAnidbSource(source));

  // The server puts AniDB first when the list leaves it out, so it is only written below another source.
  const handleChange = (value: string[]) => onChange(isAnidbSource(value[0] ?? '') ? value.slice(1) : value);

  // The picker never sees AniDB, so it goes back after the sources that led it and are still picked.
  const handlePick = (picked: string[]) => {
    const kept = picked.filter(source => !isAnidbSource(source));
    const before = sources.slice(0, sources.indexOf(anidb)).filter(source => kept.includes(source)).length;
    handleChange([...kept.slice(0, before), anidb, ...kept.slice(before)]);
  };

  return (
    <div className="flex flex-col gap-y-3">
      {/* Each source keeps the spelling the settings have it in, so a name no route lists is saved back as it was. */}
      <OrderList
        label="Sources"
        items={getTextSourceOrder(sources, textSources).map((source, index) => ({
          key: sources[index],
          content: <TextSourceLabel source={source} />,
          isRemovable: !isAnidbSource(sources[index]),
        }))}
        onOrderChange={handleChange}
        onAdd={() => setShowModal(true)}
        addTooltip="Add Source"
        isPending={linkSourcesQuery.isPending}
        errorMessage={linkSourcesQuery.isError ? 'Failed to load metadata sources.' : undefined}
      />
      <TextSourcesModal
        type={showModal ? 'Studio & Genre' : null}
        order={others}
        sources={otherSources}
        onOrderChange={handlePick}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SeasonDetailSources;
