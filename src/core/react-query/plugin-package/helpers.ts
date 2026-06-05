import semver from 'semver';

import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
  PluginUpdateSummaryType,
} from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';
import type { PackageInfoType } from '@/core/types/api/plugin-package';

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

const isSameRelease = (
  left: Pick<PluginPackageCatalogReleaseType, 'RepositoryID' | 'SourceRevision' | 'Tag' | 'Version'>,
  right: Pick<PluginPackageCatalogReleaseType, 'RepositoryID' | 'SourceRevision' | 'Tag' | 'Version'>,
) => getReleaseKey(left) === getReleaseKey(right);

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

const getPluginKey = (plugin: Pick<PluginInfoType, 'ID' | 'Version'>) => `${plugin.ID}::${plugin.Version}`;

export const getLatestRelease = (entry: PluginPackageCatalogEntryType) => entry.Releases[0];

export const getLatestInstalledRelease = (entry: PluginPackageCatalogEntryType) =>
  [...entry.Releases]
    .filter(release => release.InstalledPlugins.length > 0)
    .sort(sortReleasesByVersionDescending)[0];

export const getUpdateRelease = (entry: PluginPackageCatalogEntryType) =>
  entry.Releases.find(release => release.IsUpdateAvailable);

export const groupPluginPackages = (packages: PackageInfoType[]) => {
  const map = new Map<string, PluginPackageCatalogEntryType>();

  packages.forEach((packageInfo) => {
    const {
      Archive,
      Manifest,
      Plugin,
      Release,
    } = packageInfo;

    const existingEntry: PluginPackageCatalogEntryType = map.get(Manifest.PackageID) ?? {
      PackageID: Manifest.PackageID,
      Name: Manifest.Name,
      Overview: Manifest.Overview,
      Authors: Manifest.Authors,
      Tags: Manifest.Tags,
      Thumbnail: Manifest.Thumbnail,
      LastFetchedAt: Manifest.LastFetchedAt,
      InstalledPlugins: [],
      Releases: [],
      HasCompatibleInstallOption: false,
      HasInstalledVersion: false,
      HasUpdateAvailable: false,
    };

    const archiveInfo: PluginPackageCatalogArchiveType = {
      ...Archive,
      IsCompatible: Archive.IsCompatible,
      IsInstalled: !!Plugin,
    };
    const isMatchingRelease = (item: PluginPackageCatalogReleaseType) => isSameRelease(item, Release);

    let releaseInfo: PluginPackageCatalogReleaseType | undefined = existingEntry.Releases.find(isMatchingRelease);

    if (!releaseInfo) {
      releaseInfo = {
        ...Release,
        Archives: [],
        InstalledPlugins: [],
        IsInstalled: false,
        IsLatest: false,
        IsUpdateAvailable: false,
      };
      existingEntry.Releases.push(releaseInfo);
    }

    releaseInfo.Archives.push(archiveInfo);
    if (Plugin) {
      if (
        !releaseInfo.InstalledPlugins.some(installedPlugin => getPluginKey(installedPlugin) === getPluginKey(Plugin))
      ) {
        releaseInfo.InstalledPlugins.push(Plugin);
      }

      if (
        !existingEntry.InstalledPlugins.some(installedPlugin => getPluginKey(installedPlugin) === getPluginKey(Plugin))
      ) {
        existingEntry.InstalledPlugins.push(Plugin);
      }
    }

    releaseInfo.IsInstalled = releaseInfo.InstalledPlugins.length > 0;

    existingEntry.HasCompatibleInstallOption = existingEntry.HasCompatibleInstallOption || archiveInfo.IsCompatible;
    existingEntry.HasInstalledVersion = existingEntry.InstalledPlugins.length > 0;

    map.set(Manifest.PackageID, existingEntry);
  });

  return [...map.values()]
    .map((entry) => {
      const sortedReleases = [...entry.Releases].sort(sortReleasesByVersionDescending);
      const latestInstalledPlugin = getLatestInstalledPlugin(entry.InstalledPlugins);
      const installedVersion = getInstalledPluginVersion(latestInstalledPlugin);
      const latestVersion = sortedReleases[0]?.Version;

      const releases = sortedReleases.map((release, index): PluginPackageCatalogReleaseType => ({
        ...release,
        IsLatest: index === 0,
        IsUpdateAvailable: !!installedVersion && isVersionGreaterThan(release.Version, installedVersion),
        Archives: [...release.Archives].sort(sortArchivesByRuntimeIdentifier),
      }));

      return {
        ...entry,
        InstalledPlugins: [...entry.InstalledPlugins].sort(
          (left, right) =>
            compareVersionsDescending(left.Version, right.Version)
            || right.InstalledAt.localeCompare(left.InstalledAt)
            || left.ID.localeCompare(right.ID),
        ),
        Releases: releases,
        HasInstalledVersion: entry.InstalledPlugins.length > 0,
        HasUpdateAvailable: !!installedVersion
          && !!latestVersion
          && isVersionGreaterThan(latestVersion, installedVersion),
      };
    })
    .sort(sortEntriesByUpdatePriorityAndName);
};

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
    .filter(entry => entry.InstalledPlugins.length > 0 && entry.HasUpdateAvailable)
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
