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

const isSameRelease = (release: PluginPackageCatalogReleaseType, repositoryId: string, version: string) =>
  release.Version === version && release.RepositoryID === repositoryId;

const sortReleasesByVersionDescending = (
  left: PluginPackageCatalogReleaseType,
  right: PluginPackageCatalogReleaseType,
) => {
  // Handle cases where version might be missing or invalid
  if (!left.Version || !right.Version) {
    if (left.Version) return -1;
    if (right.Version) return 1;
    return 0;
  }

  try {
    return semver.compare(right.Version, left.Version);
  } catch {
    // Fallback to string comparison if semver fails
    return right.Version.localeCompare(left.Version);
  }
};

const sortArchivesByRuntimeIdentifier = (
  left: PluginPackageCatalogArchiveType,
  right: PluginPackageCatalogArchiveType,
) => left.RuntimeIdentifier.localeCompare(right.RuntimeIdentifier);

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
      Plugin,
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
    const isMatchingRelease = (item: PluginPackageCatalogReleaseType) =>
      isSameRelease(item, Release.RepositoryID, Release.Version);

    let releaseInfo: PluginPackageCatalogReleaseType | undefined = existingEntry.Releases.find(isMatchingRelease);

    if (!releaseInfo) {
      releaseInfo = {
        ...Release,
        Archives: [],
        IsInstalled: false,
        IsLatest: false,
        IsUpdateAvailable: false,
      };
      existingEntry.Releases.push(releaseInfo);
    }

    releaseInfo.Archives.push(archiveInfo);
    releaseInfo.IsInstalled = releaseInfo.IsInstalled || !!Plugin;

    existingEntry.HasCompatibleInstallOption = existingEntry.HasCompatibleInstallOption || archiveInfo.IsCompatible;
    existingEntry.HasInstalledVersion = existingEntry.HasInstalledVersion || !!Plugin;
    existingEntry.Plugin ??= Plugin;

    map.set(Manifest.PackageID, existingEntry);
  });

  return [...map.values()]
    .map((entry) => {
      const sortedReleases = [...entry.Releases].sort(sortReleasesByVersionDescending);
      const installedVersion = getInstalledPluginVersion(entry.Plugin);
      const latestVersion = sortedReleases[0]?.Version;

      const releases = sortedReleases.map((release, index): PluginPackageCatalogReleaseType => ({
        ...release,
        IsLatest: index === 0,
        IsUpdateAvailable: !!installedVersion && isVersionGreaterThan(release.Version, installedVersion),
        Archives: [...release.Archives].sort(sortArchivesByRuntimeIdentifier),
      }));

      return {
        ...entry,
        Releases: releases,
        HasUpdateAvailable: !!installedVersion
          && !!latestVersion
          && isVersionGreaterThan(latestVersion, installedVersion),
      };
    })
    .sort((left, right) => left.Name.localeCompare(right.Name));
};

export const groupInstalledPlugins = (plugins: PluginInfoType[]) => {
  const groups = new Map<string, PluginInfoType[]>();

  [...plugins]
    .sort((left, right) => left.Name.localeCompare(right.Name) || semver.compare(right.Version, left.Version))
    .forEach((plugin) => {
      const pluginGroup = groups.get(plugin.ID) ?? [];
      pluginGroup.push(plugin);
      groups.set(plugin.ID, pluginGroup);
    });

  return Object.fromEntries(groups);
};

export const getPluginUpdates = (entries: PluginPackageCatalogEntryType[]) =>
  entries
    .filter(entry => entry.Plugin && entry.HasUpdateAvailable)
    .map<PluginUpdateSummaryType>(entry => ({
      ID: entry.Plugin!.ID,
      PackageID: entry.PackageID,
      Name: entry.Name,
      CurrentVersion: entry.Plugin!.Version,
      LatestVersion: entry.Releases[0].Version,
      RuntimeIdentifier: entry.Plugin!.RuntimeIdentifier,
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
