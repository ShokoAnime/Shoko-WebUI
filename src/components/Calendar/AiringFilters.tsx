import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { mdiFilterVariant } from '@mdi/js';
import { Icon } from '@mdi/react';

import { Badge } from '@/components/Badge';
import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import { useAiringProvidersQuery } from '@/core/react-query/airing-schedule/queries';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';

const releaseTypes = [
  { label: 'All Releases', value: 'All' },
  { label: 'Original', value: 'Original' },
  { label: 'Subtitled', value: 'Subtitled' },
  { label: 'Dubbed', value: 'Dubbed' },
];

const AiringFilters = () => {
  const providers = useAiringProvidersQuery().data ?? [];
  const { hideEstimates, kind, provider, scope, setParams, showReruns } = useAiringScheduleParams();
  // A filter with nothing to choose from is left out, unless the URL already sets it, so it is never set unseen.
  const showReleaseTypes = new Set(providers.flatMap(item => item.EnabledKinds)).size > 1 || kind !== 'All';
  const showProviders = providers.filter(item => item.IsEnabled).length > 1 || !!provider;
  const activeCount = [scope === 'all', kind !== 'All', !!provider, hideEstimates, showReruns].filter(Boolean).length;

  return (
    <Popover className="flex">
      <PopoverButton className="flex items-center gap-x-2 transition-colors hover:text-panel-text-primary data-open:text-panel-text-primary">
        <Icon path={mdiFilterVariant} size={1} />
        Filters
        {activeCount > 0 && <Badge className="bg-panel-text-important text-button-primary-text">{activeCount}</Badge>}
      </PopoverButton>
      <PopoverPanel
        anchor="bottom start"
        transition
        className="z-50 flex w-80 origin-top-left flex-col gap-y-3 rounded-lg border border-panel-border bg-panel-background-alt p-4 text-sm font-normal text-panel-text drop-shadow-md transition [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:opacity-0"
      >
        <SelectSmall
          id="scope"
          label="Show"
          value={scope}
          onChange={event => setParams({ scope: event.target.value === 'all' ? 'all' : null })}
        >
          <option value="collection">My Collection</option>
          <option value="all">All Series</option>
        </SelectSmall>
        {showReleaseTypes && (
          <SelectSmall
            id="kind"
            label="Release Type"
            value={kind}
            onChange={event => setParams({ kind: event.target.value === 'All' ? null : event.target.value })}
          >
            {releaseTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </SelectSmall>
        )}
        {showProviders && (
          <SelectSmall
            id="provider"
            label="Provider"
            value={providers.some(item => item.ID === provider) ? provider : ''}
            onChange={event => setParams({ provider: event.target.value || null })}
          >
            <option value="">All Providers</option>
            {providers.map(item => <option key={item.ID} value={item.ID}>{item.Name}</option>)}
          </SelectSmall>
        )}
        <Checkbox
          justify
          id="showEstimates"
          isChecked={!hideEstimates}
          onChange={event => setParams({ hideEstimates: event.target.checked ? null : 'true' })}
          label="Estimates"
          tooltip="Show the airings estimated from a schedule's regular slot"
        />
        <Checkbox
          justify
          id="showReruns"
          isChecked={showReruns}
          onChange={event => setParams({ showReruns: event.target.checked ? 'true' : null })}
          label="Reruns"
          tooltip="Show the reruns, whether the provider marked them or Shoko detected them"
        />
      </PopoverPanel>
    </Popover>
  );
};

export default AiringFilters;
