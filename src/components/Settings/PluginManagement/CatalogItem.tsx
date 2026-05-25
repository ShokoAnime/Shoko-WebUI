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

const getReleaseActionLabel = (release: PluginPackageCatalogReleaseType) => {
  if (release.IsInstalled) return 'Installed';
  if (release.Archives.some(archive => archive.IsCompatible)) return 'Install';
  return 'Unavailable';
};

const ReleaseCard = ({ entry, onInstall, release }: ReleaseCardProps) => {
  const hasCompatibleArchive = release.Archives.some(archive => archive.IsCompatible);

  return (
    <div className="rounded-lg border border-panel-border bg-panel-background-alt p-2">
      <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-x-3 sm:py-1">
        <div className="flex flex-wrap items-center gap-2">
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

        <div className="text-sm whitespace-nowrap opacity-65">
          {`Released ${new Date(release.ReleasedAt).toLocaleDateString()}`}
        </div>

        <div className="flex justify-start sm:justify-end">
          <Button
            buttonType={release.IsInstalled ? 'secondary' : 'primary'}
            buttonSize="small"
            onClick={() => onInstall(entry, release.Version)}
            disabled={release.IsInstalled || !hasCompatibleArchive}
          >
            {getReleaseActionLabel(release)}
          </Button>
        </div>
      </div>

      {!hasCompatibleArchive && !release.IsInstalled && (
        <div className="mb-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-100">
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

    const fetchThumbnail = async () => {
      const thumbnailPluginId = entry.Plugin?.Thumbnail ? entry.Plugin.ID : undefined;
      const thumbnailPackageId = entry.Thumbnail ? entry.PackageID : undefined;

      if (!thumbnailPluginId && !thumbnailPackageId) return;

      const thumbnailEndpoint = thumbnailPluginId
        ? getPluginThumbnailUrl(thumbnailPluginId)
        : getPluginPackageThumbnailUrl(thumbnailPackageId!);

      const contentType = entry.Plugin?.Thumbnail?.MimeType ?? entry.Thumbnail?.MimeType;

      try {
        const response = await axios.get<Blob>(thumbnailEndpoint, {
          responseType: 'blob',
        });

        const responseBlob = response as unknown as Blob;
        const blob = contentType && responseBlob.type !== contentType
          ? responseBlob.slice(0, responseBlob.size, contentType)
          : responseBlob;

        objectUrl = URL.createObjectURL(blob);
        setThumbnailUrl(objectUrl);
      } catch {
        // Missing thumbnails are expected for some packages/plugins.
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
    <div className="rounded-lg border border-panel-border bg-panel-input p-3">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0">
          {thumbnailUrl
            ? (
              <img
                src={thumbnailUrl}
                alt={entry.Name}
                className="block size-18 rounded-lg border border-panel-border object-contain"
                onError={() => setThumbnailUrl(undefined)}
              />
            )
            : <div className="size-18 rounded-lg border border-panel-border bg-panel-background-alt" />}
        </div>

        <div className="flex grow flex-col gap-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-x-4">
            <div className="flex flex-col gap-y-1">
              <div className="text-lg font-semibold">{entry.Name}</div>
              <div className="text-sm opacity-80">{entry.Overview}</div>

              <div className="flex flex-wrap items-center gap-x-2 text-xs opacity-65">
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

            <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
              {entry.HasUpdateAvailable && (
                <span className="rounded-lg bg-button-primary px-2 py-1 text-xs text-button-primary-text">
                  Update available
                </span>
              )}

              {entry.HasInstalledVersion && (
                <span className="rounded-lg bg-panel-background-alt px-2 py-1 text-xs">
                  Installed
                </span>
              )}

              {!entry.HasCompatibleInstallOption && (
                <span className="rounded-lg border border-button-danger-border px-2 py-1 text-xs text-button-danger-text">
                  Incompatible
                </span>
              )}
            </div>
          </div>

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

          <div className="flex flex-col gap-y-3">
            {newestRelease && (
              <ReleaseCard
                entry={entry}
                onInstall={onInstall}
                release={newestRelease}
              />
            )}

            {olderReleases.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <button
                  type="button"
                  className="self-start text-sm font-semibold opacity-80 transition-opacity hover:opacity-100"
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
        </div>
      </div>
    </div>
  );
};

export default CatalogItem;
