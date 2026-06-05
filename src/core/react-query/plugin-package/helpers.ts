import semver from 'semver';

import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
  PluginUpdateSummaryType,
} from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';
import type { PackageManifestInfoType } from '@/core/types/api/plugin-package';

const getInstalledPluginVersion = (plugin?: PluginInfoType | null) => plugin?.Version ?? null;

const isVersionGreaterThan = (
  left: string,
  right: string,
) => (semver.valid(left) && semver.valid(right) ? semver.gt(left, right) : false);

const compareVersionsDescending = (leftVersion?: string, rightVersion?: string) => {
  if (!leftVersion || !rightVersion) {
    if (leftVersion) return -1;
    if (rightVersion) return 1;
    return 0;
  }

  const leftIsValid = semver.valid(leftVersion);
  const rightIsValid = semver.valid(rightVersion);

  if (leftIsValid && rightIsValid) {
    return semver.compare(rightVersion, leftVersion);
  }

  if (leftIsValid) return -1;
  if (rightIsValid) return 1;

  return rightVersion.localeCompare(leftVersion);
};

export const getReleaseKey = (
  release: Pick<PluginPackageCatalogReleaseType, 'RepositoryID' | 'SourceRevision' | 'Tag' | 'Version'>,
) => [release.RepositoryID, release.Version, release.Tag ?? '', release.SourceRevision ?? ''].join('::');

const sortReleasesByVersionDescending = (
  left: PluginPackageCatalogReleaseType,
  right: PluginPackageCatalogReleaseType,
) =>
  compareVersionsDescending(left.Version, right.Version)
  || right.ReleasedAt.localeCompare(left.ReleasedAt)
  || getReleaseKey(left).localeCompare(getReleaseKey(right));

const sortArchivesByRuntimeIdentifier = (
  left: PluginPackageCatalogArchiveType,
  right: PluginPackageCatalogArchiveType,
) => left.RuntimeIdentifier.localeCompare(right.RuntimeIdentifier);

const sortEntriesByUpdatePriorityAndName = (
  left: Pick<PluginPackageCatalogEntryType, 'HasUpdateAvailable' | 'Name'>,
  right: Pick<PluginPackageCatalogEntryType, 'HasUpdateAvailable' | 'Name'>,
) => Number(right.HasUpdateAvailable) - Number(left.HasUpdateAvailable) || left.Name.localeCompare(right.Name);

const sortInstalledPluginGroupEntries = (
  left: { hasUpdateAvailable: boolean, plugins: PluginInfoType[] },
  right: { hasUpdateAvailable: boolean, plugins: PluginInfoType[] },
) =>
  Number(right.hasUpdateAvailable) - Number(left.hasUpdateAvailable)
  || left.plugins[0].Name.localeCompare(right.plugins[0].Name);

const getLatestInstalledPlugin = (plugins: PluginInfoType[]) =>
  [...plugins].sort(
    (left, right) =>
      compareVersionsDescending(left.Version, right.Version)
      || right.InstalledAt.localeCompare(left.InstalledAt)
      || left.ID.localeCompare(right.ID),
  )[0];

export const getLatestRelease = (entry: PluginPackageCatalogEntryType) => entry.Releases[0];

export const getLatestInstalledRelease = (entry: PluginPackageCatalogEntryType) =>
  [...entry.Releases]
    .filter(release => release.IsInstalled || release.InstalledPlugins.length > 0)
    .sort(sortReleasesByVersionDescending)[0];

export const getUpdateRelease = (entry: PluginPackageCatalogEntryType) =>
  entry.Releases.find(release => release.IsUpdateAvailable);

const releaseMatchesPlugin = (
  release: Pick<PluginPackageCatalogReleaseType, 'SourceRevision' | 'Tag' | 'Version'>,
  plugin: PluginInfoType,
) =>
  release.Version === plugin.Version
  && (
    (!!plugin.SourceRevision && release.SourceRevision === plugin.SourceRevision)
    || (!!plugin.ReleaseTag && release.Tag === plugin.ReleaseTag)
    || (!plugin.SourceRevision && !plugin.ReleaseTag)
  );

const getSortedInstalledPlugins = (plugins: PluginInfoType[]) =>
  [...plugins].sort(
    (left, right) =>
      compareVersionsDescending(left.Version, right.Version)
      || right.InstalledAt.localeCompare(left.InstalledAt)
      || left.ID.localeCompare(right.ID),
  );

export const mapPluginPackageManifests = (
  manifests: PackageManifestInfoType[],
  installedPlugins: PluginInfoType[] = [],
) =>
  manifests
    .map((manifest): PluginPackageCatalogEntryType => {
      const manifestPlugins = installedPlugins.filter(plugin => plugin.Name === manifest.Name);
      const sortedReleases = (manifest.Releases ?? [])
        .map((release): PluginPackageCatalogReleaseType => ({
          ...release,
          Archives: [...(release.Archives ?? [])].sort(sortArchivesByRuntimeIdentifier),
          InstalledPlugins: getSortedInstalledPlugins(
            manifestPlugins.filter(plugin => releaseMatchesPlugin(release, plugin)),
          ),
          IsLatest: false,
          IsUpdateAvailable: false,
        }))
        .sort(sortReleasesByVersionDescending);
      const entryInstalledPlugins = getSortedInstalledPlugins(
        manifestPlugins.filter(plugin => sortedReleases.some(release => releaseMatchesPlugin(release, plugin))),
      );
      const latestInstalledPlugin = getLatestInstalledPlugin(entryInstalledPlugins);
      const installedVersion = getInstalledPluginVersion(latestInstalledPlugin)
        ?? sortedReleases.find(release => release.IsInstalled)?.Version;
      const latestVersion = sortedReleases[0]?.Version;
      const releases = sortedReleases.map((release, index): PluginPackageCatalogReleaseType => ({
        ...release,
        IsLatest: index === 0,
        IsUpdateAvailable: !!installedVersion && isVersionGreaterThan(release.Version, installedVersion),
      }));

      return {
        PackageID: manifest.PackageID,
        Name: manifest.Name,
        Overview: manifest.Overview,
        Authors: manifest.Authors,
        Tags: manifest.Tags,
        Thumbnail: manifest.Thumbnail,
        LastFetchedAt: manifest.LastFetchedAt,
        InstalledPlugins: entryInstalledPlugins,
        Releases: releases,
        HasCompatibleInstallOption: releases.some(
          release => release.Archives.some(archive => archive.IsCompatible),
        ),
        HasInstalledVersion: entryInstalledPlugins.length > 0 || releases.some(release => release.IsInstalled),
        HasUpdateAvailable: !!installedVersion
          && !!latestVersion
          && isVersionGreaterThan(latestVersion, installedVersion),
      };
    })
    .sort(sortEntriesByUpdatePriorityAndName);

export const groupInstalledPlugins = (plugins: PluginInfoType[]) => {
  const groups = new Map<string, PluginInfoType[]>();

  [...plugins]
    .sort(
      (left, right) =>
        left.Name.localeCompare(right.Name)
        || compareVersionsDescending(left.Version, right.Version)
        || right.InstalledAt.localeCompare(left.InstalledAt)
        || left.ID.localeCompare(right.ID),
    )
    .forEach((plugin) => {
      const pluginGroup = groups.get(plugin.ID) ?? [];
      pluginGroup.push(plugin);
      groups.set(plugin.ID, pluginGroup);
    });

  return Object.fromEntries(groups);
};

export const sortInstalledPluginGroups = (
  groupedPlugins: Record<string, PluginInfoType[]>,
  groupedPackages: PluginPackageCatalogEntryType[],
) =>
  Object.entries(groupedPlugins)
    .map(([pluginId, plugins]) => {
      const updateEntry = groupedPackages.find(
        entry => entry.InstalledPlugins.some(plugin => plugin.ID === pluginId) && entry.HasUpdateAvailable,
      );

      return {
        hasUpdateAvailable: !!updateEntry,
        pluginId,
        plugins,
      };
    })
    .sort(sortInstalledPluginGroupEntries)
    .map(({ pluginId, plugins }) => [pluginId, plugins] as const);

export const getPluginUpdates = (entries: PluginPackageCatalogEntryType[]) =>
  entries
    .filter(entry => entry.HasInstalledVersion && entry.HasUpdateAvailable)
    .map<PluginUpdateSummaryType>(entry => ({
      PackageID: entry.PackageID,
      Name: entry.Name,
      CurrentVersion: getLatestInstalledRelease(entry)?.Version ?? '',
      LatestVersion: getLatestRelease(entry)?.Version ?? '',
      Release: getUpdateRelease(entry) ?? getLatestRelease(entry),
    }));

export const getPackageInstallArgs = (
  packageId: string,
  release: PluginPackageCatalogReleaseType,
  archive: PluginPackageCatalogArchiveType,
) => ({
  packageId,
  releaseVersion: release.Version,
  abstractionVersion: archive.AbstractionVersion,
  runtimeIdentifier: archive.RuntimeIdentifier,
});
