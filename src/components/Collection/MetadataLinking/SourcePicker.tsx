import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import { isSameKey } from '@/core/react-query/metadata/helpers';

import type { MetadataLinkSourceType } from '@/core/types/api/metadata';

type Props = {
  /** Whether the sources are still loading, or the only one is being picked. */
  isLoading: boolean;
  /** The sources that can be linked now. */
  sources: MetadataLinkSourceType[];
  /** The IDs the series is linked to, by source, from the series' `IDs.Linked`. */
  linkedIds: Record<string, string[]>;
  onPick: (source: string) => void;
};

const getHint = (item: MetadataLinkSourceType, isLinked: boolean) => {
  if (!item.Status.IsConfigured) return 'not configured';
  if (item.Status.IsPaused) return 'paused';
  if (isLinked) return 'already linked';
  if (item.IsSeriesEnabled && item.IsMovieEnabled) return 'series and movies';
  return item.IsMovieEnabled ? 'movies only' : 'series only';
};

/** The list of sources to link a series to, shown before one is picked. */
const SourcePicker = ({ isLoading, linkedIds, onPick, sources }: Props) => {
  const isLinked = (source: string) =>
    Object.entries(linkedIds).some(([key, ids]) => isSameKey(key, source) && ids.length > 0);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="rounded-lg border border-panel-border bg-panel-background-alt p-4 font-semibold">
        Link to a source
      </div>
      <div className="flex flex-col gap-y-1 rounded-lg border border-panel-border bg-panel-input p-2">
        {isLoading && (
          <div className="flex justify-center p-4 text-panel-text-primary">
            <Icon path={mdiLoading} size={1} spin />
          </div>
        )}
        {!isLoading && sources.length === 0 && (
          <div className="p-2 opacity-65">No source can be linked to right now.</div>
        )}
        {!isLoading && sources.map(item => (
          <button
            key={item.Source}
            type="button"
            className="flex items-center gap-x-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-panel-toggle-background-hover"
            onClick={() => onPick(item.Source)}
          >
            <MetadataSourceIcon hasIcon={item.HasIcon} source={item.Source} />
            <span className="font-semibold">{item.Name}</span>
            <span className="ml-auto text-sm opacity-65">{getHint(item, isLinked(item.Source))}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SourcePicker;
