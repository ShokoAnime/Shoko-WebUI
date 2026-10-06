import AiringProviderIcon from '@/components/AiringProviderIcon';
import DnDList from '@/components/DnDList/DnDList';
import AiringProviderSettings from '@/components/Settings/AiringScheduleSettings/AiringProviderSettings';
import { getDistinctPluginName } from '@/core/utilities/getDistinctPluginName';

import type { AiringScheduleProviderType } from '@/core/types/api/airing-schedule';
import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  /** Every provider, in the drafted order. */
  providers: AiringScheduleProviderType[];
  /** Takes the providers, in their new order and with their new settings, into the draft. */
  onChange: (providers: AiringScheduleProviderType[]) => void;
};

/**
 * The providers' priority, then every provider with its own settings, each followed by a divider. Every change goes
 * into the airing schedule draft, sent by the page's save.
 */
const AiringProviderList = ({ onChange, providers }: Props) => {
  const handleReorder = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const items = [...providers];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  };

  const handleProviderChange = (provider: AiringScheduleProviderType) =>
    onChange(providers.map(item => (item.ID === provider.ID ? provider : item)));

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-1 font-semibold">
          Provider Priority
          {providers.length > 1 && <span className="text-xs font-normal opacity-65">(Drag to Reorder)</span>}
        </div>
        <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {providers.length === 0
            ? <div className="text-sm opacity-65">No airing schedule provider is registered.</div>
            : (
              <DnDList onDragEnd={handleReorder}>
                {providers.map((provider) => {
                  const pluginName = getDistinctPluginName(provider.Name, provider.Plugin.Name);
                  return {
                    key: provider.ID,
                    item: (
                      <div className="flex items-center gap-x-2 py-1">
                        <AiringProviderIcon providerId={provider.ID} hasIcon={provider.HasIcon} />
                        {provider.Name}
                        {pluginName && <span className="text-xs opacity-65">{`(${pluginName})`}</span>}
                      </div>
                    ),
                  };
                })}
              </DnDList>
            )}
        </div>
        <div className="text-sm opacity-65">
          When several providers know an episode, the first one listed is trusted first. A provider is turned on and off
          by its kinds, in its section below.
        </div>
      </div>

      <div className="border-b border-panel-border" />

      {providers.map(provider => (
        <div key={provider.ID} className="flex flex-col gap-y-6">
          <AiringProviderSettings provider={provider} onChange={handleProviderChange} />
          <div className="border-b border-panel-border" />
        </div>
      ))}
    </>
  );
};

export default AiringProviderList;
