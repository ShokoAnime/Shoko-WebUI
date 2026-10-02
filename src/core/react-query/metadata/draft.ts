import { isEmpty, isEqual, omit } from 'lodash';

import { axios } from '@/core/axios';
import { isSameKey, toSourceProvidersBody } from '@/core/react-query/metadata/helpers';
import queryClient, { processError } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type { MetadataKindProviderType, MetadataSourceKindType } from '@/core/react-query/metadata/helpers';
import type { MetadataSourceProvidersUpdateRequestType } from '@/core/react-query/metadata/types';
import type { MetadataLinkSourceType, MetadataProviderType } from '@/core/types/api/metadata';

/** The unsaved auto-link choices of one source; a field left out is unchanged. */
export type MetadataAutoLinkDraftType = {
  /** The new auto-linker, or `null` for none. */
  autoLinkerId?: string | null;
  autoLink?: boolean;
  autoLinkRestricted?: boolean;
};

/** The unsaved provider changes of the metadata page, sent on the settings page's Save. */
export type MetadataProviderDraftType = {
  /** By source, then by kind: the kind's providers in their new order, with their new switches. */
  kinds: Record<string, Record<string, MetadataKindProviderType[]>>;
  /** By source. */
  autoLink: Record<string, MetadataAutoLinkDraftType>;
};

export const emptyMetadataDraft: MetadataProviderDraftType = { kinds: {}, autoLink: {} };

export const isMetadataDraftEmpty = (draft: MetadataProviderDraftType) =>
  isEmpty(draft.kinds) && isEmpty(draft.autoLink);

const toComparable = (providers: MetadataKindProviderType[]) =>
  providers.map(provider => ({ id: provider.id, isEnabled: provider.isEnabled }));

/** The draft with a kind's providers set, or the kind's draft dropped when it is as the server has it. */
export const withKindDraft = (
  draft: MetadataProviderDraftType,
  source: string,
  serverKind: MetadataSourceKindType,
  providers: MetadataKindProviderType[],
): MetadataProviderDraftType => {
  const sourceKinds = omit(draft.kinds[source] ?? {}, serverKind.entityType);
  if (!isEqual(toComparable(providers), toComparable(serverKind.providers))) {
    sourceKinds[serverKind.entityType] = providers;
  }
  return {
    ...draft,
    kinds: isEmpty(sourceKinds) ? omit(draft.kinds, source) : { ...draft.kinds, [source]: sourceKinds },
  };
};

/** The kinds as the user sees them, with the drafted ones in place. The first enabled provider is the active one. */
export const applyKindDrafts = (
  kinds: MetadataSourceKindType[],
  sourceDraft?: Record<string, MetadataKindProviderType[]>,
) =>
  kinds.map((kind) => {
    const providers = sourceDraft?.[kind.entityType];
    if (!providers) return kind;
    const activeId = providers.find(provider => provider.isEnabled)?.id;
    return {
      ...kind,
      providers: providers.map(provider => ({
        ...provider,
        isActive: provider.id === activeId,
      })),
    };
  });

/**
 * The provider a source's auto-link switches are read from and sent to: its auto-linker, else the first that can
 * auto-link. The switches belong to the source, so any of its providers takes them.
 */
export const getAutoLinkTargetId = (providers: MetadataProviderType[]) =>
  (providers.find(provider => provider.IsAutoLinker) ?? providers.find(provider => provider.SupportsAutoLinking)
    ?? providers[0])?.ID;

/** The auto-link choices of a source as the server has them. */
export const getServerAutoLink = (providers: MetadataProviderType[]) => {
  const targetId = getAutoLinkTargetId(providers);
  const target = providers.find(provider => provider.ID === targetId);
  return {
    autoLinkerId: providers.find(provider => provider.IsAutoLinker)?.ID ?? null,
    autoLink: target?.AutoLink ?? false,
    autoLinkRestricted: target?.AutoLinkRestricted ?? false,
  };
};

/** The draft with an auto-link change merged in, dropping the fields that are as the server has them. */
export const withAutoLinkDraft = (
  draft: MetadataProviderDraftType,
  source: string,
  providers: MetadataProviderType[],
  change: MetadataAutoLinkDraftType,
): MetadataProviderDraftType => {
  const server = getServerAutoLink(providers);
  const merged = { ...draft.autoLink[source], ...change };
  const changed = Object.fromEntries(
    Object.entries(merged).filter(([key, value]) => server[key as keyof typeof server] !== value),
  ) as MetadataAutoLinkDraftType;
  return {
    ...draft,
    autoLink: isEmpty(changed) ? omit(draft.autoLink, source) : { ...draft.autoLink, [source]: changed },
  };
};

const showError = (title: string, error: unknown) => {
  const { message } = processError(error as Error);
  toast.error(title, message);
};

const saveAutoLink = async (providers: MetadataProviderType[], change: MetadataAutoLinkDraftType) => {
  const server = getServerAutoLink(providers);
  const body: Record<string, boolean> = {};
  let targetId = getAutoLinkTargetId(providers);
  if (change.autoLinkerId !== undefined) {
    if (change.autoLinkerId) {
      targetId = change.autoLinkerId;
      body.IsAutoLinker = true;
    } else if (server.autoLinkerId) {
      body.IsAutoLinker = false;
    }
  }
  if (change.autoLink !== undefined) body.AutoLink = change.autoLink;
  if (change.autoLinkRestricted !== undefined) body.AutoLinkRestricted = change.autoLinkRestricted;
  if (!targetId || isEmpty(body)) return;
  await axios.put(`Metadata/Provider/${targetId}`, body);
};

/**
 * Sends the provider changes, one source at a time: its kinds through one `PUT Metadata/Source/{source}/Providers`,
 * then its auto-link choices through `PUT Metadata/Provider/{id}`. A failed request shows the server's error and keeps its part of the draft for another
 * try; the others go on. Refetches the providers and orders, then returns what is left.
 */
export const saveMetadataDraft = async (draft: MetadataProviderDraftType) => {
  const remaining: MetadataProviderDraftType = { kinds: { ...draft.kinds }, autoLink: { ...draft.autoLink } };
  const allProviders = queryClient.getQueryData<MetadataProviderType[]>(['metadata', 'provider']) ?? [];
  const providersOf = (source: string) => allProviders.filter(provider => isSameKey(provider.Source, source));
  const linkSources = queryClient.getQueryData<MetadataLinkSourceType[]>(['metadata', 'source']) ?? [];
  const getSourceName = (source: string) => linkSources.find(item => isSameKey(item.Source, source))?.Name ?? source;

  for (const [source, kinds] of Object.entries(draft.kinds)) {
    try {
      const body: MetadataSourceProvidersUpdateRequestType = Object.entries(kinds).flatMap((
        [entityType, providers],
      ) => toSourceProvidersBody(entityType, providers));
      // oxlint-disable-next-line no-await-in-loop -- one source at a time, so the errors read in order
      await axios.put(`Metadata/Source/${encodeURIComponent(source)}/Providers`, body);
      delete remaining.kinds[source];
    } catch (error) {
      showError(`The providers of ${getSourceName(source)} were not saved!`, error);
    }
  }

  for (const [source, change] of Object.entries(draft.autoLink)) {
    try {
      // oxlint-disable-next-line no-await-in-loop -- one source at a time, so the errors read in order
      await saveAutoLink(providersOf(source), change);
      delete remaining.autoLink[source];
    } catch (error) {
      showError(`The auto-linking of ${getSourceName(source)} was not saved!`, error);
    }
  }

  // Refetched before the draft goes, so the saved choices never flash back to the old ones.
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['metadata', 'provider'] }),
    queryClient.refetchQueries({ queryKey: ['metadata', 'source'] }),
  ]).catch(console.error);

  return remaining;
};
