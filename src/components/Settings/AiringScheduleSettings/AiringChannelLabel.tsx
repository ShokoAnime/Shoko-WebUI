import AiringChannelCountryBadge from '@/components/AiringChannelCountryBadge';

import type { AiringChannelKindType } from '@/core/types/api/airing-schedule';

type Props = {
  name: string;
  countryCode?: string | null;
  type?: AiringChannelKindType | null;
  /** Listed in the name's tooltip when there are any. */
  aliases?: string[];
};

/** A channel as the airing schedule settings list it: its name, its country badge, then its type. */
const AiringChannelLabel = ({ aliases, countryCode, name, type }: Props) => {
  const hasAliases = !!aliases && aliases.length > 0;
  return (
    <span className="flex min-w-0 items-center gap-x-1">
      <span
        className="truncate"
        data-tooltip-id={hasAliases ? 'tooltip' : undefined}
        data-tooltip-content={hasAliases ? `Also known as ${aliases.join(', ')}` : undefined}
      >
        {name}
      </span>
      <AiringChannelCountryBadge countryCode={countryCode} />
      {type && <span className="shrink-0 text-xs opacity-65">{type}</span>}
    </span>
  );
};

export default AiringChannelLabel;
