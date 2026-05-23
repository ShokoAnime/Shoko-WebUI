import type {
  PluginPackageCatalogArchiveType,
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
  PluginUpdateSummaryType,
} from '@/core/react-query/plugin-package/types';
import type { PluginInfoType } from '@/core/types/api/plugin';
import type { PackageInfoType } from '@/core/types/api/plugin-package';

const compareVersionStrings = (left: string, right: string) => {
  const leftParts = left.split('.').map(part => Number.parseInt(part, 10) || 0);
  const rightParts = right.split('.').map(part => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
};

const getInstalledPluginVersion = (plugin?: PluginInfoType | null) => plugin?.Version ?? null;

const createArchiveCompatibilityKey = (packageInfo: PackageInfoType) =>
  [
    packageInfo.Manifest.PackageID,
    packageInfo.Release.RepositoryID,
    packageInfo.Release.Version,
    packageInfo.Archive.RuntimeIdentifier,
    packageInfo.Archive.AbstractionVersion,
  ].join('::');

const createCompatibleArchiveLookup = (packages: PackageInfoType[]) =>
  new Set(packages.map(createArchiveCompatibilityKey));

const isSameRelease = (release: PluginPackageCatalogReleaseType, repositoryId: string, version: string) =>
  release.Version === version && release.RepositoryID === repositoryId;

const sortReleasesByVersionDescending = (
  left: PluginPackageCatalogReleaseType,
  right: PluginPackageCatalogReleaseType,
) => compareVersionStrings(right.Version, left.Version);

const sortArchivesByRuntimeIdentifier = (
  left: PluginPackageCatalogArchiveType,
  right: PluginPackageCatalogArchiveType,
) => left.RuntimeIdentifier.localeCompare(right.RuntimeIdentifier);

export const groupPluginPackages = (packages: PackageInfoType[], compatiblePackages: PackageInfoType[] = packages) => {
  const map = new Map<string, PluginPackageCatalogEntryType>();
  const compatibleArchives = createCompatibleArchiveLookup(compatiblePackages);

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
      IsCompatible: compatibleArchives.has(createArchiveCompatibilityKey(packageInfo)),
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
        IsUpdateAvailable: !!installedVersion && compareVersionStrings(release.Version, installedVersion) > 0,
        Archives: [...release.Archives].sort(sortArchivesByRuntimeIdentifier),
      }));

      return {
        ...entry,
        Releases: releases,
        HasUpdateAvailable: !!installedVersion
          && !!latestVersion
          && compareVersionStrings(latestVersion, installedVersion) > 0,
      };
    })
    .sort((left, right) => left.Name.localeCompare(right.Name));
};

export const groupInstalledPlugins = (plugins: PluginInfoType[]) =>
  [...plugins]
    .sort((left, right) => left.Name.localeCompare(right.Name) || compareVersionStrings(right.Version, left.Version))
    .reduce<Record<string, PluginInfoType[]>>((groups, plugin) => ({
      ...groups,
      [plugin.ID]: [...(groups[plugin.ID] ?? []), plugin],
    }), {});

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
