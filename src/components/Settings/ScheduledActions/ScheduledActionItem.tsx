import { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiChevronDown, mdiPencilCircleOutline, mdiPlayCircleOutline, mdiStopCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useToggle } from 'usehooks-ts';

import ConfirmationPromptModal from '@/components/Dialogs/ConfirmationPromptModal';
import Button from '@/components/Input/Button';
import InsetPanel from '@/components/Panels/InsetPanel';
import {
  describeMinutes,
  describeNextRun,
  describeTrigger,
  formatRunTime,
  getStateBadge,
  isBusy,
  timeSpanToMinutes,
} from '@/core/react-query/scheduled-action/helpers';
import {
  useCancelScheduledActionMutation,
  useInvokeScheduledActionMutation,
} from '@/core/react-query/scheduled-action/mutations';
import toast from '@/core/toast';

import type { ScheduledActionType } from '@/core/types/api/scheduled-action';

type Props = {
  action: ScheduledActionType;
  onEditTriggers: (id: string) => void;
};

/** A scheduled action row: its state and runs, run now and cancel, and a read-only accordion of its details. */
const ScheduledActionItem = ({ action, onEditTriggers }: Props) => {
  const [open, toggleOpen] = useToggle(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { isPending: isInvokePending, mutate: invoke } = useInvokeScheduledActionMutation();
  const { isPending: isCancelPending, mutate: cancel } = useCancelScheduledActionMutation();

  const minimumMinutes = timeSpanToMinutes(action.MinimumInterval);
  const busy = isBusy(action.State);
  const badge = getStateBadge(action);

  const handleInvoke = () => invoke(action.ID, { onSuccess: () => toast.success(`"${action.Name}" queued!`) });

  const handleCancel = () => cancel(action.ID, { onSuccess: () => toast.info(`Cancelling "${action.Name}".`) });

  const handleRun = () => {
    if (action.RequiresConfirmation) setShowConfirm(true);
    else handleInvoke();
  };

  const triggersText = action.Triggers.map(describeTrigger).join(', ');
  const nextRunText = describeNextRun(action.NextRunAt, triggersText);
  const summary = action.NextRunAt ? `Next: ${nextRunText} | ${triggersText}` : nextRunText;

  return (
    <InsetPanel className="flex flex-col">
      <div className="flex items-center gap-x-2 px-4 py-2">
        <div className="flex grow flex-col gap-y-0.5">
          <div className="flex items-center gap-x-2">
            <div
              className="truncate font-semibold"
              data-tooltip-content={action.Name}
              data-tooltip-id="tooltip"
            >
              {action.Name}
            </div>
            {badge && (
              <span className={cx('shrink-0 text-xs font-semibold opacity-65', badge.className)}>{badge.label}</span>
            )}
          </div>
          <span className="text-sm opacity-65">{summary}</span>
        </div>

        {busy && action.IsCancellable && (
          <Button onClick={handleCancel} loading={isCancelPending} tooltip="Cancel the current run">
            <Icon className="text-panel-text-danger" path={mdiStopCircleOutline} size={1} />
          </Button>
        )}

        <Button onClick={() => onEditTriggers(action.ID)} tooltip="Edit triggers">
          <Icon className="text-panel-text-primary" path={mdiPencilCircleOutline} size={1} />
        </Button>

        <Button
          onClick={handleRun}
          loading={isInvokePending}
          disabled={busy}
          tooltip={busy ? 'A run is already in the queue' : 'Run now'}
        >
          <Icon className="text-panel-icon-action" path={mdiPlayCircleOutline} size={1} />
        </Button>

        <Button
          onClick={toggleOpen}
          aria-expanded={open}
          tooltip={open ? 'Hide details' : 'Show details'}
        >
          <Icon
            className={cx('transition-transform', open && 'rotate-180')}
            path={mdiChevronDown}
            size={1}
          />
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
            <div className="opacity-65">Last Run</div>
            <div>{action.LastRunAt ? formatRunTime(action.LastRunAt) : 'Never'}</div>

            <div className="opacity-65">Last Run by a Trigger</div>
            <div>{action.LastScheduledRunAt ? formatRunTime(action.LastScheduledRunAt) : 'Never'}</div>

            <div className="opacity-65">Next Run</div>
            <div>{nextRunText}</div>

            <div className="opacity-65">Minimum Interval</div>
            <div>{describeMinutes(minimumMinutes)}</div>
          </div>

          <div className="text-sm opacity-65">
            {action.ScheduleCountsManualRuns
              ? 'A manual run counts toward the schedule, so the triggers count from the last run of any kind.'
              : 'The triggers count from the last run a trigger started; a manual run is not held back.'}
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
    </InsetPanel>
  );
};

export default ScheduledActionItem;
