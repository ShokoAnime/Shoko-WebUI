import { groupBy, orderBy, uniq } from 'lodash';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';
import type {
  MetadataLinkSourceType,
  MetadataProviderType,
  MetadataSourceProvidersType,
  MetadataSourceStatusType,
} from '@/core/types/api/metadata';

/** The route segment for a kind of linked entry. */
export const toRouteKind = (type: MetadataLinkType) => (type === 'Movie' ? 'Movie' : 'Series');

/** Whether a source is TMDB, which has extras of its own on the linking page. */
export const isTmdbSource = (source: string) => source.toLowerCase() === 'tmdb';

const isSameKey = (first: string, second: string) => first.toLowerCase() === second.toLowerCase();

const entityTypeNames: Record<string, string> = {
  show: 'Series',
  season: 'Seasons',
  episode: 'Episodes',
  movie: 'Movies',
  franchise: 'Collections',
  creator: 'Creators',
  character: 'Characters',
  studio: 'Studios',
  network: 'Networks',
};

const entityTypeOrder = Object.keys(entityTypeNames);

/** A kind of entry as the settings name it, e.g. `Show` as "Series". Plugin kinds are sent as their value. */
export const getEntityTypeName = (entityType: string) =>
  entityTypeNames[entityType.toLowerCase()] ?? `${entityType.charAt(0).toUpperCase()}${entityType.slice(1)}`;

export type MetadataKindProviderType = {
  id: string;
  name: string;
  pluginName: string;
  isEnabled: boolean;
  /** Whether the provider is the one answering: the first enabled one of the kind. */
  isActive: boolean;
};

export type MetadataSourceKindType = {
  entityType: string;
  /** The providers that can answer the kind, primary first when `isOrdered`. */
  providers: MetadataKindProviderType[];
  /** Whether the order and the switches come from, and are set through, `Metadata/Source/{source}/Providers`. */
  isOrdered: boolean;
};

export type MetadataSourceSummaryType = {
  source: string;
  name: string;
  hasIcon: boolean;
  status: MetadataSourceStatusType;
  providers: MetadataProviderType[];
};

/**
 * Every source the providers answer for, with its name and status from `GET Metadata/Source` when it lists the source,
 * as that route only lists the sources series or movies are linked to. The providers say whether it has an icon.
 */
export const getMetadataSources = (
  providers: MetadataProviderType[],
  linkSources: MetadataLinkSourceType[] = [],
): MetadataSourceSummaryType[] =>
  Object.values(groupBy(providers, provider => provider.Source.toLowerCase())).map((sourceProviders) => {
    const { Source: source, Status: status } = sourceProviders[0];
    const linkSource = linkSources.find(item => isSameKey(item.Source, source));
    return {
      source,
      name: linkSource?.Name ?? source,
      hasIcon: (linkSource?.HasIcon ?? false) || sourceProviders.some(provider => provider.HasIcon),
      status: linkSource?.Status ?? status,
      providers: sourceProviders,
    };
  });

/**
 * The kinds a source's providers can answer, each with the providers able to. With the rows of
 * `GET Metadata/Source/{source}/Providers`, a kind's providers follow its row's order and switches.
 */
export const getSourceKinds = (
  providers: MetadataProviderType[],
  rows?: MetadataSourceProvidersType[] | null,
): MetadataSourceKindType[] => {
  const entityTypes = orderBy(
    uniq(providers.flatMap(provider => provider.AvailableEntityTypes)),
    [
      (entityType) => {
        const index = entityTypeOrder.indexOf(entityType.toLowerCase());
        return index === -1 ? entityTypeOrder.length : index;
      },
      entityType => entityType.toLowerCase(),
    ],
  );

  return entityTypes.map((entityType) => {
    const able = providers.filter(provider =>
      provider.AvailableEntityTypes.some(available => isSameKey(available, entityType))
    );
    const row = rows?.find(item => isSameKey(item.EntityType, entityType));
    if (!row) {
      return {
        entityType,
        isOrdered: false,
        providers: able.map((provider) => {
          const isEnabled = provider.EnabledEntityTypes.some(enabled => isSameKey(enabled, entityType));
          return {
            id: provider.ID,
            name: provider.Name,
            pluginName: provider.Plugin.Name,
            isEnabled,
            isActive: isEnabled,
          };
        }),
      };
    }

    return {
      entityType,
      isOrdered: true,
      providers: orderBy(row.Providers, 'Priority').map(item => ({
        id: item.ProviderID,
        name: item.Name,
        pluginName: able.find(provider => provider.ID === item.ProviderID)?.Plugin.Name ?? '',
        isEnabled: item.IsEnabled,
        isActive: item.IsActive,
      })),
    };
  });
};

/** The body that sets one kind's providers to a new order and new switches, primary first. */
export const toSourceProvidersBody = (entityType: string, providers: MetadataKindProviderType[]) => [{
  EntityType: entityType,
  Providers: providers.map((provider, index) => ({
    ProviderID: provider.id,
    IsEnabled: provider.isEnabled,
    Priority: index,
  })),
}];
