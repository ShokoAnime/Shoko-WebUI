import { isEmpty, isEqual, omit } from 'lodash';

import { axios } from '@/core/axios';
import { toSourceProvidersBody } from '@/core/react-query/metadata/helpers';
import queryClient, { processError } from '@/core/react-query/queryClient';
import toast from '@/core/toast';

import type { MetadataKindProviderType, MetadataSourceKindType } from '@/core/react-query/metadata/helpers';
import type { MetadataSourceProvidersUpdateRequestType } from '@/core/react-query/metadata/types';
import type { MetadataProviderType, MetadataSourceProvidersType } from '@/core/types/api/metadata';

/** The unsaved auto-link choices of one source; a field left out is unchanged. */
export type MetadataAutoLinkDraftType = {
  /** The new auto-linker, or `null` for none. */
  autoLinkerId?: string | null;
  AutoLink?: boolean;
  AutoLinkRestricted?: boolean;
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

/**
 * The kinds as the user sees them, with the drafted ones in place. The first enabled provider of an ordered kind is
 * the active one; without the order route, every enabled one is.
 */
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
        isActive: kind.isOrdered ? provider.id === activeId : provider.isEnabled,
      })),
    };
  });

/** The auto-link choices of a source as the server has them. */
export const getServerAutoLink = (providers: MetadataProviderType[]) => {
  const autoLinker = providers.find(provider => provider.IsAutoLinker);
  const sourceProvider = autoLinker ?? providers.find(provider => provider.SupportsAutoLinking) ?? providers[0];
  return {
    autoLinkerId: autoLinker?.ID ?? null,
    AutoLink: sourceProvider?.AutoLink ?? false,
    AutoLinkRestricted: sourceProvider?.AutoLinkRestricted ?? false,
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

const sameKey = (first: string, second: string) => first.toLowerCase() === second.toLowerCase();

const showError = (title: string, error: unknown) => {
  const { message } = processError(error as Error);
  toast.error(title, message);
};

/** Without the order route: each provider's enabled kinds, through `PUT Metadata/Provider/{id}`. */
const saveKindsOneByOne = async (
  providers: MetadataProviderType[],
  kinds: Record<string, MetadataKindProviderType[]>,
) => {
  const requests = providers.flatMap((provider) => {
    let enabled = [...provider.EnabledEntityTypes];
    for (const [entityType, kindProviders] of Object.entries(kinds)) {
      const entry = kindProviders.find(item => item.id === provider.ID);
      if (entry) {
        enabled = enabled.filter(item => !sameKey(item, entityType));
        if (entry.isEnabled) enabled.push(entityType);
      }
    }
    if (isEqual([...enabled].sort(), [...provider.EnabledEntityTypes].sort())) return [];
    const turnsOn = enabled.some(entityType => !provider.EnabledEntityTypes.some(item => sameKey(item, entityType)));
    return [{ id: provider.ID, enabled, turnsOn }];
  });
  // A kind turned on moves to its provider, so the ones turning kinds off go first.
  requests.sort((first, second) => Number(first.turnsOn) - Number(second.turnsOn));
  for (const request of requests) {
    // oxlint-disable-next-line no-await-in-loop -- each one depends on the server state the previous one left
    await axios.put(`Metadata/Provider/${request.id}`, { EnabledEntityTypes: request.enabled });
  }
};

const saveAutoLink = async (providers: MetadataProviderType[], change: MetadataAutoLinkDraftType) => {
  const server = getServerAutoLink(providers);
  const body: Record<string, boolean> = {};
  let targetId = server.autoLinkerId ?? providers.find(provider => provider.SupportsAutoLinking)?.ID;
  if (change.autoLinkerId !== undefined) {
    if (change.autoLinkerId) {
      targetId = change.autoLinkerId;
      body.IsAutoLinker = true;
    } else if (server.autoLinkerId) {
      body.IsAutoLinker = false;
    }
  }
  if (change.AutoLink !== undefined) body.AutoLink = change.AutoLink;
  if (change.AutoLinkRestricted !== undefined) body.AutoLinkRestricted = change.AutoLinkRestricted;
  if (!targetId || isEmpty(body)) return;
  await axios.put(`Metadata/Provider/${targetId}`, body);
};

/**
 * Sends the provider changes, one source at a time: its kinds through one `PUT Metadata/Source/{source}/Providers`
 * (or a provider at a time on a server without that route), then its auto-link choices through
 * `PUT Metadata/Provider/{id}`. A failed request shows the server's error and keeps its part of the draft for another
 * try; the others go on. Refetches the providers and orders, then returns what is left.
 */
export const saveMetadataDraft = async (draft: MetadataProviderDraftType) => {
  const remaining: MetadataProviderDraftType = { kinds: { ...draft.kinds }, autoLink: { ...draft.autoLink } };
  const allProviders = queryClient.getQueryData<MetadataProviderType[]>(['metadata', 'provider']) ?? [];
  const providersOf = (source: string) => allProviders.filter(provider => sameKey(provider.Source, source));

  for (const [source, kinds] of Object.entries(draft.kinds)) {
    const rows = queryClient.getQueryData<MetadataSourceProvidersType[] | null>(
      ['metadata', 'source', source, 'providers'],
    );
    try {
      if (rows === null) {
        // oxlint-disable-next-line no-await-in-loop -- one source at a time, so the errors read in order
        await saveKindsOneByOne(providersOf(source), kinds);
      } else {
        const body: MetadataSourceProvidersUpdateRequestType = Object.entries(kinds).flatMap((
          [entityType, providers],
        ) => toSourceProvidersBody(entityType, providers));
        // oxlint-disable-next-line no-await-in-loop -- one source at a time, so the errors read in order
        await axios.put(`Metadata/Source/${encodeURIComponent(source)}/Providers`, body);
      }
      delete remaining.kinds[source];
    } catch (error) {
      showError(`The providers of ${source} were not saved!`, error);
    }
  }

  for (const [source, change] of Object.entries(draft.autoLink)) {
    try {
      // oxlint-disable-next-line no-await-in-loop -- one source at a time, so the errors read in order
      await saveAutoLink(providersOf(source), change);
      delete remaining.autoLink[source];
    } catch (error) {
      showError(`The auto-linking of ${source} was not saved!`, error);
    }
  }

  // Refetched before the draft goes, so the saved choices never flash back to the old ones.
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['metadata', 'provider'] }),
    queryClient.refetchQueries({ queryKey: ['metadata', 'source'] }),
  ]).catch(console.error);

  return remaining;
};
