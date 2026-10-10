import cx from 'classnames';

import Checkbox from '@/components/Input/Checkbox';
import SelectSmall from '@/components/Input/SelectSmall';
import { getAutoLinkTargetId, getServerAutoLink } from '@/core/react-query/metadata/draft';

import type { MetadataAutoLinkDraftType } from '@/core/react-query/metadata/draft';
import type { MetadataProviderType } from '@/core/types/api/metadata';

type Props = {
  /** The providers of one source. */
  providers: MetadataProviderType[];
  source: string;
  /** The unsaved choices, shown over the server's. */
  draft?: MetadataAutoLinkDraftType;
  /** Takes a change into the draft. */
  onDraftChange: (change: MetadataAutoLinkDraftType) => void;
};

/** The auto-linker of one source and its auto-link switches. Nothing when no provider auto-links. */
const MetadataAutoLinkSettings = ({ draft, onDraftChange, providers, source }: Props) => {
  const autoLinkers = providers.filter(provider => provider.SupportsAutoLinking);
  const targetId = getAutoLinkTargetId(providers);
  if (autoLinkers.length === 0 || !targetId) return null;

  const server = getServerAutoLink(providers);
  const autoLinkerId = draft?.autoLinkerId !== undefined ? draft.autoLinkerId : server.autoLinkerId;
  const autoLink = draft?.autoLink ?? server.autoLink;
  const autoLinkRestricted = draft?.autoLinkRestricted ?? server.autoLinkRestricted;

  return (
    <div className="flex flex-col gap-y-1">
      <SelectSmall
        id={`metadata-${source}-auto-linker`}
        label="Auto-Linker"
        value={autoLinkerId ?? ''}
        onChange={event => onDraftChange({ autoLinkerId: event.target.value || null })}
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
          onChange={event => onDraftChange({ autoLink: event.target.checked })}
        />
        <Checkbox
          justify
          id={`metadata-${source}-auto-link-restricted`}
          label="Auto Link Restricted"
          isChecked={autoLinkRestricted}
          onChange={event => onDraftChange({ autoLinkRestricted: event.target.checked })}
        />
      </div>
    </div>
  );
};

export default MetadataAutoLinkSettings;
