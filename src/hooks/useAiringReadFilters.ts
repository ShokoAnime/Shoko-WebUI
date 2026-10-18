import { useAiringProvidersQuery } from '@/core/react-query/airing-schedule/queries';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import { AIRING_KINDS } from '@/core/utilities/airingSchedule';
import useAiringScheduleParams from '@/hooks/useAiringScheduleParams';

/** What the calendar and the season reads share: the filters of the URL and the settings, as the requests take them. */
const useAiringReadFilters = () => {
  const { hideEstimates, kind, provider: providerId, scope } = useAiringScheduleParams();
  const { hideR18Content } = useSettingsQuery().data.WebUI_Settings.dashboard;
  const providersQuery = useAiringProvidersQuery();
  const provider = providersQuery.data?.find(item => item.ID === providerId);

  const filters = {
    inCollection: scope === 'all' ? 'true' : 'only',
    includeRestricted: hideR18Content ? 'false' : 'true',
  } as const;

  return {
    /** The anime filters, which the season list takes alone. */
    filters,
    /** The anime filters with those of the airings. */
    args: {
      ...filters,
      // The server's default kind is the original broadcasts only, so "all" names them.
      kind: kind === 'All' ? AIRING_KINDS : [kind],
      provider: provider && [provider.ID],
      includeEstimates: !hideEstimates,
    },
    hasEnabledProvider: providersQuery.data?.some(item => item.IsEnabled) ?? true,
    // A provider named in the URL is looked up first, so an unknown one is never sent.
    isReady: !providerId || providersQuery.isSuccess,
  };
};

export default useAiringReadFilters;
