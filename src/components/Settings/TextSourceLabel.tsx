import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';

import type { TextSourceType } from '@/core/react-query/metadata/helpers';

/** A source's icon and name, with its plugin's name when that differs. */
const TextSourceLabel = ({ source }: { source: TextSourceType }) => (
  <div className="flex items-center gap-x-2">
    <MetadataSourceIcon hasIcon={source.hasIcon} source={source.source} />
    {source.name}
    {source.pluginName && <span className="text-xs opacity-65">{`(${source.pluginName})`}</span>}
  </div>
);

export default TextSourceLabel;
