import { groupBy, orderBy } from 'lodash';

import { getDistinctPluginName } from '@/core/utilities/getDistinctPluginName';

import type { MetadataLinkType } from '@/core/react-query/metadata/types';
import type {
  MetadataLinkSourceType,
  MetadataProviderType,
  MetadataSourceProvidersType,
  MetadataSourceStatusType,
} from '@/core/types/api/metadata';

/** The route segment for a kind of linked entry. */
export const toRouteKind = (type: MetadataLinkType) => (type === 'Movie' ? 'Movie' : 'Series');

/**
 * The episode picker's first page. The linking page fetches the same page to learn whether a series has episodes, so
 * the picker starts from the cache.
 */
export const episodePickerParams = { search: '', pageSize: 30 };

/** Whether two keys the server matches ignoring case, such as sources, are the same. */
export const isSameKey = (first: string, second: string) => first.toLowerCase() === second.toLowerCase();

/** Whether a source is AniDB, which every series is linked to. */
export const isAnidbSource = (source: string) => isSameKey(source, 'AniDB');

/** Whether a series or a movie can be linked to the source now. */
export const isLinkableSource = (source: MetadataLinkSourceType) => source.IsSeriesEnabled || source.IsMovieEnabled;

/** Whether a source is TMDB, which the series page lists first. */
export const isTmdbSource = (source: string) => isSameKey(source, 'tmdb');

/** A source titles and descriptions can be chosen from, as the language settings show it. */
export type TextSourceType = {
  /** The source, as the settings and the metadata routes take it. */
  source: string;
  name: string;
  /** The plugin serving the source, or `null` when it is the core or its name repeats the source's. */
  pluginName: string | null;
  /** Whether the source has an icon, served at `Metadata/Source/{source}/Icon`. */
  hasIcon: boolean;
};

/**
 * The sources titles and descriptions can come from: AniDB, which `GET Metadata/Source` leaves out, then every source
 * from that route. Users' texts are not offered, as the server always uses them after the listed sources.
 */
export const getTextSources = (
  linkSources: MetadataLinkSourceType[] = [],
  providers: MetadataProviderType[] = [],
): TextSourceType[] => [
  { source: 'AniDB', name: 'AniDB', pluginName: null, hasIcon: true },
  ...linkSources.map(item => ({
    source: item.Source,
    name: item.Name,
    pluginName: getDistinctPluginName(
      item.Name,
      providers.find(provider => provider.PluginID === item.PluginID)?.Plugin.Name,
    ),
    hasIcon: item.HasIcon,
  })),
];

/**
 * The sources of an order as the settings show them, in order. A source no route lists, such as one of a plugin not
 * loaded now, is kept under its own name.
 */
export const getTextSourceOrder = (order: string[], sources: TextSourceType[]): TextSourceType[] =>
  order.map(source =>
    sources.find(item => isSameKey(item.source, source)) ?? { source, name: source, pluginName: null, hasIcon: false }
  );

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
  /** The providers that can answer the kind, in the order they are tried. */
  providers: MetadataKindProviderType[];
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
 * as that route only lists the sources series or movies can be linked to. It has an icon when either list says so.
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

const getKindOrder = (entityType: string) => {
  const index = entityTypeOrder.indexOf(entityType.toLowerCase());
  return index === -1 ? entityTypeOrder.length : index;
};

/**
 * The kinds of a source from the rows of `GET Metadata/Source/{source}/Providers`, one per kind its providers can
 * answer, each with its providers in order and their switches.
 */
export const getSourceKinds = (
  providers: MetadataProviderType[],
  rows: MetadataSourceProvidersType[] = [],
): MetadataSourceKindType[] =>
  orderBy(rows, [row => getKindOrder(row.EntityType), row => row.EntityType.toLowerCase()]).map(row => ({
    entityType: row.EntityType,
    providers: orderBy(row.Providers, 'Priority').map(item => ({
      id: item.ProviderID,
      name: item.Name,
      pluginName: providers.find(provider => provider.ID === item.ProviderID)?.Plugin.Name ?? '',
      isEnabled: item.IsEnabled,
      isActive: item.IsActive,
    })),
  }));

/** The body that sets one kind's providers to a new order and new switches, primary first. */
export const toSourceProvidersBody = (entityType: string, providers: MetadataKindProviderType[]) => [{
  EntityType: entityType,
  Providers: providers.map((provider, index) => ({
    ProviderID: provider.id,
    IsEnabled: provider.isEnabled,
    Priority: index,
  })),
}];
