import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { isEqual, map, uniqueId } from 'lodash';

import Button from '@/components/Input/Button';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';
import TriggerEditor from '@/components/Settings/ScheduledActions/TriggerEditor';
import {
  createTrigger,
  describeMinutes,
  describeNextRun,
  describeTrigger,
  getValidationErrors,
  timeSpanToMinutes,
  triggerTypes,
} from '@/core/react-query/scheduled-action/helpers';
import {
  useResetScheduledActionTriggersMutation,
  useSetScheduledActionTriggersMutation,
} from '@/core/react-query/scheduled-action/mutations';
import toast from '@/core/toast';
import useSyncedState from '@/hooks/useSyncedState';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import type { ScheduledActionTriggerType, ScheduledActionType } from '@/core/types/api/scheduled-action';

type Props = {
  action: ScheduledActionType;
  onClose: () => void;
};

const withKeys = (triggers: ScheduledActionTriggerType[]) => triggers.map(trigger => ({ key: uniqueId(), trigger }));

/** The triggers of one scheduled action, edited and saved apart from the action's read-only row. */
const TriggersModal = ({ action, onClose }: Props) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Keyed, so a trigger's editor keeps its own inputs when one before it is removed. Live-synced, so a reset (which
  // answers with the action as it is now) is adopted at once.
  const [draft, setDraft] = useSyncedState(action.Triggers, withKeys);
  const draftTriggers = draft.map(item => item.trigger);
  const isEdited = !isEqual(draftTriggers, action.Triggers);

  const { isPending: isSavePending, mutate: saveTriggers } = useSetScheduledActionTriggersMutation();
  const { isPending: isResetPending, mutate: resetTriggers } = useResetScheduledActionTriggersMutation();

  const minimumMinutes = timeSpanToMinutes(action.MinimumInterval);

  const triggersText = draftTriggers.map(describeTrigger).join(', ');
  // The saved next run time belongs to the saved triggers, so it is only shown while the draft still matches them.
  const summary = !isEdited && action.NextRunAt
    ? `Next: ${describeNextRun(action.NextRunAt, triggersText)} | ${triggersText}`
    : describeNextRun(null, triggersText);

  const handleSave = () => {
    setErrors({});
    saveTriggers({ id: action.ID, triggers: draftTriggers }, {
      onSuccess: () => {
        toast.success(`Triggers of "${action.Name}" saved!`);
        onClose();
      },
      onError: error => setErrors(getValidationErrors(error)),
    });
  };

  const handleReset = () => {
    setErrors({});
    resetTriggers(action.ID, {
      onSuccess: () => toast.success(`Triggers of "${action.Name}" reset to its defaults!`),
    });
  };

  const updateTrigger = (key: string, trigger: ScheduledActionTriggerType) => {
    setErrors({});
    setDraft(draft.map(item => (item.key === key ? { key, trigger } : item)));
  };

  const removeTrigger = (key: string) => {
    setErrors({});
    setDraft(draft.filter(item => item.key !== key));
  };

  const addTrigger = (type: string) => {
    setErrors({});
    if (!type) return;
    setDraft([...draft, ...withKeys([createTrigger(type, minimumMinutes)])]);
  };

  useToggleModalKeybinds(true, 'modal');
  useHotkeys('escape', () => {
    if (!isSavePending && !isResetPending) onClose();
  }, { scopes: 'modal' });

  return (
    <ModalPanel
      show
      size="md"
      onRequestClose={isSavePending || isResetPending ? undefined : onClose}
      header={
        <div className="flex items-center gap-x-2 text-xl font-semibold">
          {action.Name}
          <span className="text-xs opacity-65">{action.HasCustomTriggers ? '(Custom)' : '(Defaults)'}</span>
        </div>
      }
      subHeader={summary}
      footer={
        <div className="flex justify-end gap-x-3 font-semibold">
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={onClose}
            disabled={isSavePending}
          >
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="normal"
            onClick={handleReset}
            loading={isResetPending}
            disabled={!action.HasCustomTriggers || isResetPending || isSavePending}
            tooltip={action.HasCustomTriggers ? '' : 'The defaults are in effect'}
          >
            Reset to Defaults
          </Button>
          <Button
            buttonType="primary"
            buttonSize="normal"
            onClick={handleSave}
            loading={isSavePending}
            disabled={!isEdited || isSavePending || isResetPending}
          >
            Save Triggers
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div>Triggers</div>

          <SelectSmall
            id={`scheduled-action-${action.ID}-add`}
            value=""
            onChange={event => addTrigger(event.target.value)}
          >
            <option value="" disabled>Add Trigger…</option>
            {map(triggerTypes, (item, type) => <option key={type} value={type}>{item.label}</option>)}
          </SelectSmall>
        </div>

        <div className="flex max-h-96 flex-col gap-y-2 overflow-y-auto pr-2">
          {draft.length === 0 && (
            <div className="text-sm opacity-65">
              No triggers. It only runs manually.
            </div>
          )}

          {draft.map((item, index) => (
            <TriggerEditor
              key={item.key}
              id={`scheduled-action-${action.ID}-${item.key}`}
              trigger={item.trigger}
              minimumMinutes={minimumMinutes}
              errors={errors[`[${index}]`]}
              onChange={trigger => updateTrigger(item.key, trigger)}
              onRemove={() => removeTrigger(item.key)}
            />
          ))}
        </div>

        {errors['']?.map(error => <div key={error} className="text-sm text-panel-text-danger">{error}</div>)}
        <div className="text-xs opacity-65">
          {`Times are in the server's time zone. Daily, weekly and monthly triggers must be at least ${
            describeMinutes(minimumMinutes)
          } apart. Defaults: ${
            action.DefaultTriggers.length > 0 ? action.DefaultTriggers.map(describeTrigger).join(', ') : 'none'
          }.`}
        </div>
      </div>
    </ModalPanel>
  );
};

export default TriggersModal;
