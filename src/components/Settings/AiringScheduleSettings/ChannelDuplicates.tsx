import AnimateHeight from 'react-animate-height';
import { mdiChevronDown } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useToggle } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import AiringChannelLabel from '@/components/Settings/AiringScheduleSettings/AiringChannelLabel';
import { useMergeAiringChannelsMutation } from '@/core/react-query/airing-schedule/mutations';
import toast from '@/core/toast';
import { findDuplicateChannels } from '@/core/utilities/airingChannels';

import type { AiringChannelType } from '@/core/types/api/airing-schedule';

/**
 * The channels that look like the same one, collapsed until opened, each group merged into its oldest channel with one
 * click. Nothing when no channels look alike.
 */
const ChannelDuplicates = ({ channels }: { channels: AiringChannelType[] }) => {
  const [open, toggleOpen] = useToggle(false);
  const { isPending, mutate: mergeChannels, variables } = useMergeAiringChannelsMutation();
  const groups = findDuplicateChannels(channels);
  if (groups.length === 0) return null;

  const handleMerge = ([target, ...sources]: AiringChannelType[]) =>
    mergeChannels({ channelId: target.ID, sourceIds: sources.map(source => source.ID) }, {
      onSuccess: () =>
        toast.success(
          'Channels merged!',
          `${sources.map(source => source.Name).join(', ')} merged into ${target.Name}.`,
        ),
    });

  return (
    <div className="flex flex-col rounded-lg border border-panel-border bg-panel-input">
      <button
        type="button"
        className="flex items-center justify-between px-4 py-2 text-left"
        onClick={toggleOpen}
        aria-expanded={open}
      >
        <span className="flex items-center gap-x-1">
          Possible Duplicates
          <span className="text-xs opacity-65">{`(${groups.length})`}</span>
        </span>
        <Icon path={mdiChevronDown} size={1} className={cx('transition-transform', open && 'rotate-180')} />
      </button>
      <AnimateHeight height={open ? 'auto' : 0}>
        <div className="flex flex-col gap-y-2 border-t border-panel-border p-4">
          <div className="text-sm opacity-65">
            Channels of the same type whose names match once case, width, spaces and punctuation are set aside. A merge
            keeps the first, the oldest; the others&apos; names become its aliases and their schedules move over to it.
          </div>
          {groups.map(group => (
            <div key={group[0].ID} className="flex items-center justify-between gap-x-4 py-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                {group.map(channel => (
                  <AiringChannelLabel key={channel.ID} name={channel.Name} countryCode={channel.CountryCode} />
                ))}
                <span className="text-xs opacity-65">{group[0].Type}</span>
              </div>
              <Button
                buttonType="secondary"
                className="shrink-0 px-3 py-1 text-sm whitespace-nowrap"
                onClick={() => handleMerge(group)}
                disabled={isPending}
                loading={isPending && variables?.channelId === group[0].ID}
              >
                {`Merge into ${group[0].Name}`}
              </Button>
            </div>
          ))}
        </div>
      </AnimateHeight>
    </div>
  );
};

export default ChannelDuplicates;
