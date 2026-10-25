import { useState } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { groupBy, map } from 'lodash';

import ScheduledActionItem from '@/components/Settings/ScheduledActions/ScheduledActionItem';
import TriggersModal from '@/components/Settings/ScheduledActions/TriggersModal';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import { useScheduledActionsQuery } from '@/core/react-query/scheduled-action/queries';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

const ScheduledActionsSettings = () => {
  const actionsQuery = useScheduledActionsQuery();
  const [selectedActionID, setSelectedActionID] = useState<string | null>(null);
  const categories = groupBy(actionsQuery.data, action => action.CategoryName);
  const selectedAction = actionsQuery.data?.find(action => action.ID === selectedActionID);

  useToggleModalKeybinds(!selectedActionID, 'primary');

  return (
    <>
      <SettingsHeader title="Scheduled Actions">
        Work Shoko runs on its own on the triggers you set, in the server&apos;s time zone. Run one now, cancel its run,
        or open it to read its details and edit its triggers.
        <div className="mt-2 text-sm opacity-65">
          Running an action manually usually counts toward its schedule, so it also affects when that action runs next.
        </div>
      </SettingsHeader>

      {actionsQuery.isPending && (
        <div className="flex justify-center text-panel-text-primary">
          <Icon path={mdiLoading} size={3} spin />
        </div>
      )}

      {actionsQuery.isError && <div className="text-panel-text-danger">Failed to load the scheduled actions.</div>}

      {actionsQuery.isSuccess && actionsQuery.data.length === 0 && (
        <div className="opacity-65">No scheduled action is registered.</div>
      )}

      {map(categories, (actions, categoryName) => (
        <div key={categoryName} className="flex flex-col gap-y-6">
          <div className="border-b border-panel-border" />
          <div className="flex flex-col gap-y-2">
            <div className="font-semibold">{categoryName}</div>
            {actions.map(action => (
              <ScheduledActionItem key={action.ID} action={action} onEditTriggers={setSelectedActionID} />
            ))}
          </div>
        </div>
      ))}

      {selectedAction && <TriggersModal action={selectedAction} onClose={() => setSelectedActionID(null)} />}
    </>
  );
};

export default ScheduledActionsSettings;
