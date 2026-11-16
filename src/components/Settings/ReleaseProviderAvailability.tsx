import cx from 'classnames';

import { dayjs } from '@/core/util';

import type { ProviderAvailabilityKindType, ProviderAvailabilityType } from '@/core/types/api/provider-availability';

type Props = {
  availability: ProviderAvailabilityType | undefined;
  /** Whether the list is for searches a person starts, where a manual-only provider works. */
  manual?: boolean;
};

const statuses: Partial<Record<ProviderAvailabilityKindType, { className: string, label: string }>> = {
  NotConfigured: { className: 'text-panel-text-danger', label: 'Not Configured' },
  Suspended: { className: 'text-panel-text-warning', label: 'Suspended' },
  ManualOnly: { className: 'text-panel-text-warning', label: 'Manual Only' },
};

// Available and disabled providers show nothing; the checkbox already says the latter.
const ReleaseProviderAvailability = ({ availability, manual = false }: Props) => {
  if (!availability || (manual && availability.Kind === 'ManualOnly')) return null;
  const status = statuses[availability.Kind];
  if (!status) return null;

  const resumes = availability.ResumesAt
    ? `Resumes ${dayjs(availability.ResumesAt).format('MMMM Do, HH:mm')}.`
    : null;
  const reason = [availability.Reason, resumes].filter(Boolean).join(' ');

  return (
    <span
      className={cx('ml-2 text-xs font-semibold', status.className)}
      data-tooltip-id="tooltip"
      data-tooltip-content={reason || undefined}
    >
      {status.label}
    </span>
  );
};

export default ReleaseProviderAvailability;
