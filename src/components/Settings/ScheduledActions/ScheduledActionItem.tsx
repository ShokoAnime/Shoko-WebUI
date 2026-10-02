import { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiPlayCircleOutline, mdiStopCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { isAxiosError } from 'axios';
import cx from 'classnames';
import { isEqual } from 'lodash';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import SelectSmall from '@/components/Input/SelectSmall';
import TriggerEditor from '@/components/Settings/ScheduledActions/TriggerEditor';
import {
  createTrigger,
  describeMinutes,
  describeTrigger,
  isBusy,
  timeSpanToMinutes,
  triggerTypes,
} from '@/core/react-query/scheduled-action/helpers';
import {
  useCancelScheduledActionMutation,
  useInvokeScheduledActionMutation,
  useResetScheduledActionTriggersMutation,
  useSetScheduledActionTriggersMutation,
} from '@/core/react-query/scheduled-action/mutations';
import toast from '@/core/toast';
import { dayjs } from '@/core/util';
import useSyncedState from '@/hooks/useSyncedState';

import type { ScheduledActionTriggerType, ScheduledActionType } from '@/core/types/api/scheduled-action';

type Props = {
  action: ScheduledActionType;
};

const formatLastRun = (time: string | null) => (time ? dayjs(time).format('MMMM Do, HH:mm') : 'Never');

// No next run is either no triggers at all, or only a start-up one.
const formatNextRun = (time: string | null, hasTriggers: boolean) => {
  if (!time) return hasTriggers ? 'At the next start-up' : 'Only by hand';
  const parsed = dayjs(time);
  return parsed.isBefore(dayjs()) ? 'Due now' : parsed.format('MMMM Do, HH:mm');
};

const getState = (action: ScheduledActionType) => {
  switch (action.State) {
    case 'Waiting':
      return { className: 'text-panel-text-warning', label: 'Waiting in Queue' };
    case 'Running':
      return {
        className: 'text-panel-text-primary',
        label: action.Progress === null ? 'Running' : `Running ${Math.round(action.Progress)}%`,
      };
    case 'CancellationRequested':
      return { className: 'text-panel-text-danger', label: 'Cancelling' };
    default:
      return null;
  }
};

// The server's validation problem, by member: `[0]` for the first trigger, the empty key for the triggers as a whole.
const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (!isAxiosError(error)) return {};
  const data = error.response?.data as { errors?: Record<string, string[]> } | undefined;
  return data?.errors ?? {};
};

let nextTriggerKey = 0;
const withKeys = (triggers: ScheduledActionTriggerType[]) =>
  triggers.map((trigger) => {
    nextTriggerKey += 1;
    return { key: nextTriggerKey, trigger };
  });

/** A scheduled action: its state and runs, run now and cancel, and its triggers, edited and saved apart. */
const ScheduledActionItem = ({ action }: Props) => {
  const [open, toggleOpen] = useToggle(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Keyed, so a trigger's editor keeps its own inputs when one before it is removed.
  const [draft, setDraft] = useSyncedState(action.Triggers, withKeys);
  const draftTriggers = draft.map(item => item.trigger);
  const isEdited = !isEqual(draftTriggers, action.Triggers);

  const { isPending: isInvokePending, mutate: invoke } = useInvokeScheduledActionMutation();
  const { isPending: isCancelPending, mutate: cancel } = useCancelScheduledActionMutation();
  const { isPending: isSavePending, mutate: saveTriggers } = useSetScheduledActionTriggersMutation(action.ID);
  const { isPending: isResetPending, mutate: resetTriggers } = useResetScheduledActionTriggersMutation(action.ID);

  const minimumMinutes = timeSpanToMinutes(action.MinimumInterval);
  const busy = isBusy(action.State);
  const state = getState(action);

  const handleInvoke = () => invoke(action.ID, { onSuccess: () => toast.success(`"${action.Name}" queued!`) });

  const handleCancel = () => cancel(action.ID, { onSuccess: () => toast.info(`Cancelling "${action.Name}".`) });

  const handleSave = () => {
    setErrors({});
    saveTriggers(draftTriggers, {
      onSuccess: () => toast.success(`Triggers of "${action.Name}" saved!`),
      onError: error => setErrors(getValidationErrors(error)),
    });
  };

  const handleReset = () => {
    setErrors({});
    resetTriggers(undefined, {
      onSuccess: () => toast.success(`Triggers of "${action.Name}" reset to its defaults!`),
    });
  };

  const handleDiscard = () => {
    setErrors({});
    setDraft(withKeys(action.Triggers));
  };

  const updateTrigger = (key: number, trigger: ScheduledActionTriggerType) =>
    setDraft(draft.map(item => (item.key === key ? { key, trigger } : item)));

  const removeTrigger = (key: number) => {
    setErrors({});
    setDraft(draft.filter(item => item.key !== key));
  };

  const addTrigger = (type: string) => {
    if (!type) return;
    setDraft([...draft, ...withKeys([createTrigger(type, minimumMinutes)])]);
  };

  const hasTriggers = action.Triggers.length > 0;
  const triggersText = action.Triggers.map(describeTrigger).join(', ');
  const getSummary = () => {
    if (!hasTriggers) return 'Only by hand';
    if (!action.NextRunAt) return triggersText;
    return `Next: ${formatNextRun(action.NextRunAt, true)} | ${triggersText}`;
  };

  return (
    <div className="flex flex-col rounded-lg border border-panel-border bg-panel-input">
      <div className="flex items-center gap-x-3 px-4 py-2">
        <button
          type="button"
          className="flex grow flex-col gap-y-0.5 text-left"
          onClick={toggleOpen}
          aria-expanded={open}
        >
          <span className="flex items-center gap-x-2">
            <span className="font-semibold">{action.Name}</span>
            {state && <span className={cx('text-sm font-semibold', state.className)}>{state.label}</span>}
          </span>
          <span className="text-sm opacity-65">{getSummary()}</span>
        </button>
        {busy && action.IsCancellable && (
          <Button onClick={handleCancel} loading={isCancelPending} tooltip="Cancel the current run">
            <Icon className="text-panel-text-danger" path={mdiStopCircleOutline} size={1} />
          </Button>
        )}
        <Button
          onClick={() => (action.RequiresConfirmation ? setShowConfirm(true) : handleInvoke())}
          loading={isInvokePending}
          disabled={busy}
          tooltip={busy ? 'A run is already in the queue' : 'Run now'}
        >
          <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
        </Button>
        <Button onClick={toggleOpen} tooltip={open ? 'Collapse' : 'Edit triggers'}>
          <Icon path={mdiChevronDown} size={1} className={cx('transition-transform', open && 'rotate-180')} />
        </Button>
      </div>
      {action.State === 'Running' && action.Progress !== null && (
        <div className="mx-4 mb-2 h-1 rounded-full bg-panel-background-alt">
          <div
            className="h-1 rounded-full bg-panel-text-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, action.Progress))}%` }}
          />
        </div>
      )}

      <AnimateHeight height={open ? 'auto' : 0}>
        <div className="flex flex-col gap-y-4 border-t border-panel-border p-4">
          {action.Description && <div className="text-sm">{action.Description}</div>}

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="opacity-65">Last Run</span>
            <span>{formatLastRun(action.LastRunAt)}</span>
            <span className="opacity-65">Last Run by a Trigger</span>
            <span>{formatLastRun(action.LastScheduledRunAt)}</span>
            <span className="opacity-65">Next Run</span>
            <span>{formatNextRun(action.NextRunAt, hasTriggers)}</span>
            <span className="opacity-65">Minimum Interval</span>
            <span>{describeMinutes(minimumMinutes)}</span>
          </div>
          <div className="text-sm opacity-65">
            {action.ScheduleCountsManualRuns
              ? 'A run by hand counts for the schedule, so the triggers count from the last run of any kind.'
              : 'The triggers count from the last run a trigger started; a run by hand is not held back.'}
          </div>

          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1">
                Triggers
                <span className="text-xs opacity-65">
                  {action.HasCustomTriggers ? '(Your Own)' : '(Defaults)'}
                </span>
              </div>
              <SelectSmall
                id={`scheduled-action-${action.ID}-add`}
                value=""
                onChange={event => addTrigger(event.target.value)}
              >
                <option value="" disabled>Add Trigger…</option>
                {triggerTypes.map(item => <option key={item.type} value={item.type}>{item.label}</option>)}
              </SelectSmall>
            </div>
            {draft.length === 0 && (
              <div className="text-sm opacity-65">
                No triggers. It only runs when run by hand.
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
            {errors['']?.map(error => <div key={error} className="text-sm text-panel-text-danger">{error}</div>)}
            <div className="text-xs opacity-65">
              {`Times are in the server's time zone. Daily, weekly and monthly triggers must be at least ${
                describeMinutes(minimumMinutes)
              } apart. Defaults: ${
                action.DefaultTriggers.length > 0 ? action.DefaultTriggers.map(describeTrigger).join(', ') : 'none'
              }.`}
            </div>
          </div>

          <div className="flex justify-end gap-x-3 font-semibold">
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
              buttonType="secondary"
              buttonSize="normal"
              onClick={handleDiscard}
              disabled={!isEdited || isSavePending}
            >
              Discard
            </Button>
            <Button
              buttonType="primary"
              buttonSize="normal"
              onClick={handleSave}
              loading={isSavePending}
              disabled={!isEdited || isSavePending}
            >
              Save Triggers
            </Button>
          </div>
        </div>
      </AnimateHeight>

      <ConfirmationPromptModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleInvoke}
        title={`Run ${action.Name}`}
        confirmText="Run Now"
      >
        {action.ConfirmationMessage ?? `Run "${action.Name}" now?`}
      </ConfirmationPromptModal>
    </div>
  );
};

export default ScheduledActionItem;
