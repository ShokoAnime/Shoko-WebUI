import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { groupBy, map } from 'lodash';

import ScheduledActionItem from '@/components/Settings/ScheduledActions/ScheduledActionItem';
import SettingsHeader from '@/components/Settings/SettingsHeader';
import { useScheduledActionsQuery } from '@/core/react-query/scheduled-action/queries';

const ScheduledActionsSettings = () => {
  const actionsQuery = useScheduledActionsQuery();
  const categories = groupBy(actionsQuery.data, action => action.CategoryName);

  return (
    <>
      <SettingsHeader title="Scheduled Actions">
        Work Shoko runs on its own on the triggers you set, in the server&apos;s time zone. Run one now, cancel its run,
        or open it to edit its triggers; each action&apos;s triggers are saved with its own button.
      </SettingsHeader>

      <div className="border-b border-panel-border" />

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
          <div className="flex flex-col gap-y-2">
            <div className="font-semibold">{categoryName}</div>
            {actions.map(action => <ScheduledActionItem key={action.ID} action={action} />)}
          </div>
          <div className="border-b border-panel-border" />
        </div>
      ))}
    </>
  );
};

export default ScheduledActionsSettings;
