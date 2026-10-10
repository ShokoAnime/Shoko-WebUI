import type { ReactNode } from 'react';
import cx from 'classnames';

import MetadataSourceIcon from '@/components/Collection/MetadataSourceIcon';
import DnDList from '@/components/DnDList/DnDList';
import Checkbox from '@/components/Input/Checkbox';
import MetadataAutoLinkSettings from '@/components/Settings/MetadataSitesSettings/MetadataAutoLinkSettings';
import MetadataProviderConfiguration from '@/components/Settings/MetadataSitesSettings/MetadataProviderConfiguration';
import { applyKindDrafts, withAutoLinkDraft, withKindDraft } from '@/core/react-query/metadata/draft';
import { getEntityTypeName, getSourceKinds } from '@/core/react-query/metadata/helpers';
import { useMetadataSourceProvidersQuery } from '@/core/react-query/metadata/queries';
import { dayjs } from '@/core/util';
import { getDistinctPluginName } from '@/core/utilities/getDistinctPluginName';

import type { MetadataProviderDraftType } from '@/core/react-query/metadata/draft';
import type {
  MetadataKindProviderType,
  MetadataSourceKindType,
  MetadataSourceSummaryType,
} from '@/core/react-query/metadata/helpers';
import type { ConfigurationInfoType } from '@/core/types/api/configuration';
import type {
  MetadataProviderType,
  MetadataSourceStatusType,
  SuspensionDetailsType,
  SuspensionKindType,
} from '@/core/types/api/metadata';
import type { DropResult } from '@hello-pangea/dnd';

type ConfigurableProviderType = MetadataProviderType & { Configuration: ConfigurationInfoType };

const hasConfiguration = (provider: MetadataProviderType): provider is ConfigurableProviderType =>
  provider.Configuration !== null;

type Props = {
  summary: MetadataSourceSummaryType;
  /** The unsaved provider changes of every source, sent by the page's save. */
  metadataDraft: MetadataProviderDraftType;
  setMetadataDraft: (draft: MetadataProviderDraftType) => void;
  /** Options of the source's own, shown below its providers. */
  children?: ReactNode;
};

const suspensionKindNames: Record<SuspensionKindType, string> = {
  RateLimited: 'Rate limited',
  Banned: 'Banned',
  ServerErrors: 'Server errors',
  Overloaded: 'Overloaded',
  AuthenticationFailed: 'Authentication failed',
  SessionInvalid: 'Session invalid',
  Maintenance: 'Down for maintenance',
  Other: 'Other',
};

// The service's own reason when it gives one, after the kind's name.
const describeSuspension = ({ Kind, Reason }: SuspensionDetailsType) => {
  const kindName = suspensionKindNames[Kind] ?? Kind;
  return Reason ? `${kindName}: ${Reason}.` : `${kindName}.`;
};

const getStatus = (status: MetadataSourceStatusType) => {
  if (!status.IsConfigured) {
    return { className: 'text-panel-text-danger', label: 'Not Configured', reason: status.NotConfiguredReason };
  }
  if (status.IsPaused) {
    const suspensions = status.Suspensions.map(describeSuspension).join(' ');
    const resumes = status.ResumesAt ? `Resumes ${dayjs(status.ResumesAt).format('MMMM Do, HH:mm')}.` : null;
    return {
      className: 'text-panel-text-warning',
      label: 'Suspended',
      reason: [suspensions || status.Reason, resumes].filter(Boolean).join(' '),
    };
  }
  return { className: 'text-panel-text-important', label: 'Configured', reason: null };
};

const MetadataSourceSettings = ({ children, metadataDraft, setMetadataDraft, summary }: Props) => {
  const { hasIcon, name, providers, source, status } = summary;

  // The orders are read from and saved through `Metadata/Source/{source}/Providers`. Changes wait for the page's save,
  // as a draft.
  const orderQuery = useMetadataSourceProvidersQuery(source);
  const serverKinds = getSourceKinds(providers, orderQuery.data);
  const kinds = applyKindDrafts(serverKinds, metadataDraft.kinds[source]);
  const { isPending } = orderQuery;
  const hasSharedKind = kinds.some(kind => kind.providers.length > 1);

  // A provider without a configuration of its own shows nothing here.
  const configurable = providers.filter(hasConfiguration);

  const { className: statusClassName, label: statusLabel, reason: statusReason } = getStatus(status);

  const setKindProviders = (kind: MetadataSourceKindType, kindProviders: MetadataKindProviderType[]) => {
    const serverKind = serverKinds.find(item => item.entityType === kind.entityType) ?? kind;
    setMetadataDraft(withKindDraft(metadataDraft, source, serverKind, kindProviders));
  };

  const handleKindToggle = (kind: MetadataSourceKindType, providerId: string, enabled: boolean) =>
    setKindProviders(
      kind,
      kind.providers.map(provider => (provider.id === providerId ? { ...provider, isEnabled: enabled } : provider)),
    );

  const handleReorder = (kind: MetadataSourceKindType, result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const items = [...kind.providers];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setKindProviders(kind, items);
  };

  const renderProviderState = (provider: MetadataKindProviderType) => {
    if (provider.isActive) return <span className="text-xs font-semibold text-panel-text-important">Active</span>;
    if (provider.isEnabled) return <span className="text-xs font-semibold opacity-65">Standby</span>;
    return null;
  };

  const renderProviderLabel = (provider: MetadataKindProviderType) => {
    const pluginName = getDistinctPluginName(provider.name, provider.pluginName);
    return (
      <div className="flex grow items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-1">
          {provider.name}
          {pluginName && <span className="text-xs opacity-65">{`(${pluginName})`}</span>}
        </div>
        {renderProviderState(provider)}
      </div>
    );
  };

  const renderKind = (kind: MetadataSourceKindType) => {
    const id = `metadata-${source}-${kind.entityType}`;
    const kindName = getEntityTypeName(kind.entityType);

    if (kind.providers.length === 1) {
      const [provider] = kind.providers;
      return (
        <Checkbox
          key={kind.entityType}
          justify
          id={id}
          label={
            <div className="flex items-center gap-x-1">
              {kindName}
              <span className="text-xs opacity-65">{provider.name}</span>
            </div>
          }
          isChecked={provider.isEnabled}
          onChange={event => handleKindToggle(kind, provider.id, event.target.checked)}
        />
      );
    }

    return (
      <div key={kind.entityType} className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-1">
          {kindName}
          <span className="text-xs opacity-65">(Drag to Reorder)</span>
        </div>
        <div className="flex rounded-lg border border-panel-border px-3 py-1">
          <DnDList onDragEnd={result => handleReorder(kind, result)}>
            {kind.providers.map(provider => ({
              key: provider.id,
              item: (
                <Checkbox
                  id={`${id}-${provider.id}`}
                  isChecked={provider.isEnabled}
                  onChange={event => handleKindToggle(kind, provider.id, event.target.checked)}
                  labelRight
                  labelClassName="grow justify-between"
                  label={renderProviderLabel(provider)}
                />
              ),
            }))}
          </DnDList>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2 font-semibold">
            <MetadataSourceIcon hasIcon={hasIcon} source={source} />
            {name}
          </div>
          <span className={cx('text-sm font-semibold', statusClassName)}>{statusLabel}</span>
        </div>
        {statusReason && <div className="text-sm opacity-65">{statusReason}</div>}
      </div>

      <div className={cx('flex flex-col gap-y-2', isPending && 'pointer-events-none opacity-65')}>
        <div>Providers</div>
        <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {kinds.map(renderKind)}
        </div>
        <div className="text-sm opacity-65">
          The kinds of entries the providers answer for.
          {hasSharedKind
            && ' Where several can, the first enabled one answers and the others stand by, taking over in order when it is turned off or removed. A suspended provider is not skipped.'}
        </div>
      </div>

      <MetadataAutoLinkSettings
        providers={providers}
        source={source}
        draft={metadataDraft.autoLink[source]}
        onDraftChange={change => setMetadataDraft(withAutoLinkDraft(metadataDraft, source, providers, change))}
      />

      {configurable.length > 0 && (
        <div className="flex flex-col gap-y-2">
          {configurable.map(provider => (
            <MetadataProviderConfiguration
              key={provider.ID}
              configuration={provider.Configuration}
              providerName={provider.Name}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default MetadataSourceSettings;
