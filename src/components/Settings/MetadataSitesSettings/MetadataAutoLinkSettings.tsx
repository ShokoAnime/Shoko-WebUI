import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import { getServerAutoLink } from '@/core/react-query/metadata/draft';
import { useUpdateMetadataProviderMutation } from '@/core/react-query/metadata/mutations';

import type { MetadataAutoLinkDraftType } from '@/core/react-query/metadata/draft';
import type { MetadataProviderType } from '@/core/types/api/metadata';

type Props = {
  /** The providers of one source. */
  providers: MetadataProviderType[];
  source: string;
  /** The unsaved choices, shown over the server's. */
  draft?: MetadataAutoLinkDraftType;
  /** Takes a change into the draft. Without it, a change is sent at once, as on the first run. */
  onDraftChange?: (change: MetadataAutoLinkDraftType) => void;
};

/** The auto-linker of one source and its auto-link switches. Nothing when no provider auto-links. */
const MetadataAutoLinkSettings = ({ draft, onDraftChange, providers, source }: Props) => {
  const { isPending, mutate: updateProvider } = useUpdateMetadataProviderMutation();

  const autoLinkers = providers.filter(provider => provider.SupportsAutoLinking);
  if (autoLinkers.length === 0) return null;

  const server = getServerAutoLink(providers);
  const autoLinkerId = draft?.autoLinkerId !== undefined ? draft.autoLinkerId : server.autoLinkerId;
  const autoLink = draft?.AutoLink ?? server.AutoLink;
  const autoLinkRestricted = draft?.AutoLinkRestricted ?? server.AutoLinkRestricted;
  // The auto-link switches belong to the source, so any of its providers takes them.
  const sourceProviderId = server.autoLinkerId ?? autoLinkers[0].ID;

  const change = (value: MetadataAutoLinkDraftType) => {
    if (onDraftChange) {
      onDraftChange(value);
      return;
    }
    if (value.autoLinkerId) updateProvider({ providerId: value.autoLinkerId, IsAutoLinker: true });
    else if (value.autoLinkerId === null && server.autoLinkerId) {
      updateProvider({ providerId: server.autoLinkerId, IsAutoLinker: false });
    }
    if (value.AutoLink !== undefined) updateProvider({ providerId: sourceProviderId, AutoLink: value.AutoLink });
    if (value.AutoLinkRestricted !== undefined) {
      updateProvider({ providerId: sourceProviderId, AutoLinkRestricted: value.AutoLinkRestricted });
    }
  };

  return (
    <div className={cx('flex flex-col gap-y-1', isPending && 'pointer-events-none opacity-65')}>
      <SelectSmall
        id={`metadata-${source}-auto-linker`}
        label="Auto-Linker"
        value={autoLinkerId ?? ''}
        onChange={event => change({ autoLinkerId: event.target.value || null })}
      >
        <option value="">None</option>
        {autoLinkers.map(provider => <option key={provider.ID} value={provider.ID}>{provider.Name}</option>)}
      </SelectSmall>
      <div className={cx('flex flex-col gap-y-1', !autoLinkerId && 'pointer-events-none opacity-65')}>
        <Checkbox
          justify
          id={`metadata-${source}-auto-link`}
          label="Auto Link"
          isChecked={autoLink}
          onChange={event => change({ AutoLink: event.target.checked })}
        />
        <Checkbox
          justify
          id={`metadata-${source}-auto-link-restricted`}
          label="Auto Link Restricted"
          isChecked={autoLinkRestricted}
          onChange={event => change({ AutoLinkRestricted: event.target.checked })}
        />
      </div>
    </div>
  );
};

export default MetadataAutoLinkSettings;
