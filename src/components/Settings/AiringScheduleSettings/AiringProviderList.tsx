import DnDList from '@/components/DnDList/DnDList';
import InsetPanel from '@/components/Panels/InsetPanel';
import AiringProviderSettings from '@/components/Settings/AiringScheduleSettings/AiringProviderSettings';

import type { AiringScheduleProviderType } from '@/core/types/api/airing-schedule';
import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  onChange: (providers: AiringScheduleProviderType[]) => void;
  providers: AiringScheduleProviderType[];
};

const AiringProviderList = ({ onChange, providers }: Props) => {
  const handleReorder = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...providers];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
  };

  return (
    <>
      {providers.length > 1 && (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-1">
            Provider Priority
            <span className="text-xs opacity-65">(Drag to Reorder)</span>
          </div>
          <InsetPanel className="flex px-4 py-2">
            <DnDList onDragEnd={handleReorder}>
              {providers.map(provider => ({ key: provider.ID, item: <div className="py-1">{provider.Name}</div> }))}
            </DnDList>
          </InsetPanel>
          <div className="text-sm opacity-65">
            When several providers know an episode, the first one listed is trusted first.
          </div>
        </div>
      )}
      {providers.map(provider => (
        <AiringProviderSettings
          key={provider.ID}
          provider={provider}
          onChange={changed => onChange(providers.map(item => (item.ID === changed.ID ? changed : item)))}
        />
      ))}
    </>
  );
};

export default AiringProviderList;
