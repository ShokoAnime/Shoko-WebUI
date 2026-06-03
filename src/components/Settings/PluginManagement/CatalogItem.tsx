import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Button from '@/components/Input/Button';
import { getReleaseKey } from '@/core/react-query/plugin-package/helpers';

import type {
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
} from '@/core/react-query/plugin-package/types';

type Props = {
  entry: PluginPackageCatalogEntryType;
  onInstall: (entry: PluginPackageCatalogEntryType, release?: PluginPackageCatalogReleaseType) => void;
};

type ReleaseCardProps = Props & {
  release: PluginPackageCatalogReleaseType;
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

const Badge = ({ children, className }: BadgeProps) => (
  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${className ?? ''}`.trim()}>
    {children}
  </span>
);

const getReleaseActionLabel = (release: PluginPackageCatalogReleaseType) => {
  if (release.IsInstalled) return 'Installed';
  if (release.Archives.some(archive => archive.IsCompatible)) return 'Install';
  return 'Unavailable';
};

const formatPluginDate = (date: string) => dayjs(date).format('D MMMM YYYY');

const ReleaseCard = ({ entry, onInstall, release }: ReleaseCardProps) => {
  const hasCompatibleArchive = release.Archives.some(archive => archive.IsCompatible);

  return (
    <div className="rounded-lg border border-panel-border bg-panel-background-alt px-3 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 sm:flex-1">
          <div className="font-semibold">
            {release.Version}
            <span className="text-sm opacity-65">
              {' '}
              (
              {release.Channel}
              )
            </span>
          </div>
        </div>

        <div className="text-sm opacity-65 sm:shrink-0">
          {`Released ${formatPluginDate(release.ReleasedAt)}`}
        </div>

        <div className="flex w-full justify-start sm:w-auto sm:shrink-0 sm:justify-end">
          <Button
            buttonType={release.IsInstalled ? 'secondary' : 'primary'}
            buttonSize="small"
            onClick={() => onInstall(entry, release)}
            disabled={release.IsInstalled || !hasCompatibleArchive}
            className="min-w-28 justify-center"
          >
            {getReleaseActionLabel(release)}
          </Button>
        </div>
      </div>

      {!hasCompatibleArchive && !release.IsInstalled && (
        <div className="mt-2 rounded-lg border border-orange-500/25 bg-orange-500/8 px-3 py-1.5 text-sm text-orange-100">
          This version is not compatible with your server version.
        </div>
      )}
    </div>
  );
};

const OLDER_VERSIONS_PAGE_SIZE = 5;

const CatalogItem = ({ entry, onInstall }: Props) => {
  const [packageThumbnailFailed, setPackageThumbnailFailed] = useState(false);
  const [pluginThumbnailFailed, setPluginThumbnailFailed] = useState(false);
  const [showOlderVersions, setShowOlderVersions] = useState(false);
  const [olderVersionsVisible, setOlderVersionsVisible] = useState(OLDER_VERSIONS_PAGE_SIZE);
  const pluginMetadata = entry.InstalledPlugins[0];

  const newestRelease = entry.Releases[0];
  const olderReleases = entry.Releases.slice(1);
  const visibleOlderReleases = olderReleases.slice(0, olderVersionsVisible);
  const hiddenOlderCount = olderReleases.length - visibleOlderReleases.length;
  const remainingToShow = Math.min(OLDER_VERSIONS_PAGE_SIZE, hiddenOlderCount);

  const toggleOlderVersions = () => {
    setShowOlderVersions((value) => {
      if (value) {
        setOlderVersionsVisible(OLDER_VERSIONS_PAGE_SIZE);
        return false;
      }

      return true;
    });
  };

  useEffect(() => {
    setPackageThumbnailFailed(false);
    setPluginThumbnailFailed(false);
  }, [entry.PackageID, entry.Thumbnail, pluginMetadata]);

  const packageThumbnailUrl = useMemo(
    () => (entry.Thumbnail ? `/api/v3/Plugin/Package/${entry.PackageID}/Thumbnail` : undefined),
    [entry.PackageID, entry.Thumbnail],
  );
  const pluginThumbnailUrl = useMemo(
    () => (pluginMetadata?.Thumbnail ? `/api/v3/Plugin/${pluginMetadata.ID}/Thumbnail` : undefined),
    [pluginMetadata],
  );
  let thumbnailSrc: string | undefined;

  if (packageThumbnailUrl && !packageThumbnailFailed) {
    thumbnailSrc = packageThumbnailUrl;
  } else if (pluginThumbnailUrl && !pluginThumbnailFailed) {
    thumbnailSrc = pluginThumbnailUrl;
  }

  return (
    <article className="overflow-hidden rounded-xl border border-panel-border bg-panel-input">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-3">
          <div className="w-full shrink-0 lg:w-44 lg:flex-none">
            {thumbnailSrc
              ? (
                <img
                  src={thumbnailSrc}
                  alt={entry.Name}
                  className="block w-full rounded-lg border border-panel-border"
                  onError={() => {
                    if (thumbnailSrc === packageThumbnailUrl) {
                      setPackageThumbnailFailed(true);
                      return;
                    }

                    if (thumbnailSrc === pluginThumbnailUrl) {
                      setPluginThumbnailFailed(true);
                    }
                  }}
                />
              )
              : (
                <div className="aspect-video w-full rounded-lg border border-panel-border bg-panel-background-alt">
                  <div className="size-full" />
                </div>
              )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">{entry.Name}</div>

            <div className="mt-2 line-clamp-3 text-sm/6 opacity-80">{entry.Overview}</div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs opacity-65">
              <span>{`By ${entry.Authors}`}</span>

              {pluginMetadata?.RepositoryUrl && (
                <a
                  href={pluginMetadata.RepositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-button-primary transition-opacity hover:opacity-80"
                  onClick={event => event.stopPropagation()}
                >
                  Repository
                </a>
              )}

              {pluginMetadata?.HomepageUrl && (
                <a
                  href={pluginMetadata.HomepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-button-primary transition-opacity hover:opacity-80"
                  onClick={event => event.stopPropagation()}
                >
                  Homepage
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {(entry.HasUpdateAvailable || !entry.HasCompatibleInstallOption) && (
            <div className="flex flex-wrap gap-2">
              {entry.HasUpdateAvailable && (
                <Badge className="border border-green-500/30 bg-green-500/20 text-green-100">
                  Update available
                </Badge>
              )}

              {!entry.HasCompatibleInstallOption && (
                <Badge className="border border-red-500/50 bg-red-500/25 text-red-100">
                  Incompatible
                </Badge>
              )}
            </div>
          )}

          {entry.Tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.Tags.map(tag => (
                <span
                  key={`${entry.PackageID}-${tag}`}
                  className="rounded-lg border border-panel-border px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(newestRelease || olderReleases.length > 0) && (
            <div className="pt-1">
              {newestRelease && (
                <div className="rounded-xl border border-panel-border bg-panel-background-alt px-3 py-2.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0 sm:flex-1">
                      <div className="text-sm font-semibold">
                        {newestRelease.Version}
                        <span className="text-sm opacity-65">
                          {' '}
                          (
                          {newestRelease.Channel}
                          )
                        </span>
                      </div>
                    </div>

                    <div className="text-sm opacity-65 sm:shrink-0">
                      {`Released ${formatPluginDate(newestRelease.ReleasedAt)}`}
                    </div>

                    <div className="flex w-full justify-start sm:w-auto sm:shrink-0 sm:justify-end">
                      <Button
                        buttonType={newestRelease.IsInstalled ? 'secondary' : 'primary'}
                        buttonSize="small"
                        onClick={() => onInstall(entry, newestRelease)}
                        disabled={newestRelease.IsInstalled
                          || !newestRelease.Archives.some(archive => archive.IsCompatible)}
                        className="min-w-28 justify-center"
                      >
                        {getReleaseActionLabel(newestRelease)}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {olderReleases.length > 0 && (
                <div className="mt-1 flex flex-col gap-y-2">
                  <button
                    type="button"
                    className="self-start text-sm font-semibold text-button-primary transition-opacity hover:opacity-80"
                    onClick={toggleOlderVersions}
                  >
                    {showOlderVersions
                      ? 'Hide older versions'
                      : `Older versions (${olderReleases.length})`}
                  </button>

                  {showOlderVersions
                    && visibleOlderReleases.map(release => (
                      <ReleaseCard
                        key={`${entry.PackageID}-${getReleaseKey(release)}`}
                        entry={entry}
                        onInstall={onInstall}
                        release={release}
                      />
                    ))}

                  {showOlderVersions && hiddenOlderCount > 0 && (
                    <button
                      type="button"
                      className="self-start text-sm font-semibold text-button-primary transition-opacity hover:opacity-80"
                      onClick={() => setOlderVersionsVisible(value => value + OLDER_VERSIONS_PAGE_SIZE)}
                    >
                      {`Show ${remainingToShow} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CatalogItem;
