import React, { useEffect, useState } from 'react';

import Button from '@/components/Input/Button';
import { axios } from '@/core/axios';
import { getPluginPackageThumbnailUrl, getPluginThumbnailUrl } from '@/core/utilities/pluginManagement';

import type {
  PluginPackageCatalogEntryType,
  PluginPackageCatalogReleaseType,
} from '@/core/react-query/plugin-package/types';

type Props = {
  entry: PluginPackageCatalogEntryType;
  onInstall: (entry: PluginPackageCatalogEntryType, releaseVersion?: string) => void;
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
          {`Released ${new Date(release.ReleasedAt).toLocaleDateString()}`}
        </div>

        <div className="flex w-full justify-start sm:w-auto sm:shrink-0 sm:justify-end">
          <Button
            buttonType={release.IsInstalled ? 'secondary' : 'primary'}
            buttonSize="small"
            onClick={() => onInstall(entry, release.Version)}
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

const CatalogItem = ({ entry, onInstall }: Props) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>();
  const [showOlderVersions, setShowOlderVersions] = useState(false);

  const newestRelease = entry.Releases[0];
  const olderReleases = entry.Releases.slice(1);

  useEffect(() => {
    let objectUrl: string | undefined;

    const fetchBlobUrl = async (url: string, contentType?: string) => {
      const response = await axios.get<Blob>(url, {
        responseType: 'blob',
      });

      const responseBlob = response as unknown as Blob;
      const blob = contentType && responseBlob.type !== contentType
        ? responseBlob.slice(0, responseBlob.size, contentType)
        : responseBlob;

      objectUrl = URL.createObjectURL(blob);
      setThumbnailUrl(objectUrl);
    };

    const fetchThumbnail = async () => {
      if (entry.Thumbnail) {
        try {
          await fetchBlobUrl(getPluginPackageThumbnailUrl(entry.PackageID), entry.Thumbnail.MimeType);
          return;
        } catch {
          // Missing package thumbnails are expected for some packages.
        }
      }

      if (entry.Plugin?.Thumbnail) {
        try {
          await fetchBlobUrl(getPluginThumbnailUrl(entry.Plugin.ID), entry.Plugin.Thumbnail.MimeType);
        } catch {
          // Missing plugin thumbnails are expected for some installed plugins.
        }
      }
    };

    fetchThumbnail().catch(() => {
      // handled in fetchThumbnail
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [entry.PackageID, entry.Plugin, entry.Thumbnail]);

  return (
    <article className="overflow-hidden rounded-xl border border-panel-border bg-panel-input">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-3">
          <div className="w-full shrink-0 lg:w-44 lg:flex-none">
            {thumbnailUrl
              ? (
                <img
                  src={thumbnailUrl}
                  alt={entry.Name}
                  className="block aspect-video w-full rounded-lg border border-panel-border bg-panel-background-alt object-contain"
                  onError={() => setThumbnailUrl(undefined)}
                />
              )
              : (
                <div className="aspect-video rounded-lg border border-dashed border-panel-border bg-panel-background-alt/60">
                  <div className="size-full" />
                </div>
              )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">{entry.Name}</div>

            <div className="mt-2 line-clamp-3 text-sm/6 opacity-80">{entry.Overview}</div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs opacity-65">
              <span>{`By ${entry.Authors}`}</span>

              {entry.Plugin?.RepositoryUrl && (
                <a
                  href={entry.Plugin.RepositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-button-primary transition-opacity hover:opacity-80"
                  onClick={event => event.stopPropagation()}
                >
                  Repository
                </a>
              )}

              {entry.Plugin?.HomepageUrl && (
                <a
                  href={entry.Plugin.HomepageUrl}
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
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-panel-border bg-panel-background-alt px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {newestRelease.Version}
                      <span className="text-sm opacity-65">
                        {' '}
                        (
                        {newestRelease.Channel}
                        )
                      </span>
                    </div>
                    <div className="mt-1 text-sm opacity-65">
                      {`Released ${new Date(newestRelease.ReleasedAt).toLocaleDateString()}`}
                    </div>
                  </div>

                  <Button
                    buttonType={newestRelease.IsInstalled ? 'secondary' : 'primary'}
                    buttonSize="small"
                    onClick={() => onInstall(entry, newestRelease.Version)}
                    disabled={newestRelease.IsInstalled
                      || !newestRelease.Archives.some(archive => archive.IsCompatible)}
                    className="min-w-28 justify-center"
                  >
                    {getReleaseActionLabel(newestRelease)}
                  </Button>
                </div>
              )}

              {olderReleases.length > 0 && (
                <div className="mt-1 flex flex-col gap-y-2">
                  <button
                    type="button"
                    className="self-start text-sm font-semibold text-button-primary transition-opacity hover:opacity-80"
                    onClick={() => setShowOlderVersions(value => !value)}
                  >
                    {showOlderVersions
                      ? 'Hide older versions'
                      : `Older versions (${olderReleases.length})`}
                  </button>

                  {showOlderVersions
                    && olderReleases.map(release => (
                      <ReleaseCard
                        key={`${entry.PackageID}-${release.Version}`}
                        entry={entry}
                        onInstall={onInstall}
                        release={release}
                      />
                    ))}
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
