import React from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import dayjs from 'dayjs';
import { find, map, some } from 'lodash';
import { useToggle } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import PluginInstallModal from '@/components/Settings/PluginManagement/Dialogs/PluginInstallModal';
import { usePluginPackageManifestsQuery } from '@/core/react-query/plugin-package/queries';

import type { PackageManifestInfoType, PackageReleaseInfoType } from '@/core/types/api/plugin-package';

type Props = {
  query: string;
};

const Version = ({ manifest, version }: { manifest: PackageManifestInfoType, version: PackageReleaseInfoType }) => {
  const [showInstallModal, toggleInstallModal] = useToggle(false);

  const isCompatible = some(version.Archives, archive => archive.IsCompatible);

  const cannotInstall = version.IsInstalled || !isCompatible;

  return (
    <>
      <div className="flex items-center gap-x-2 rounded-lg bg-panel-background-alt px-4 py-2 text-sm">
        <div className="grow font-semibold">
          {version.Version}
          <span className="opacity-65">{version.Channel === 'Dev' && ' (Dev)'}</span>
          <span className="opacity-65">{!isCompatible && ' [Incompatible]'}</span>
          {version.IsInstalled && (
            <Badge className="ml-2 bg-panel-text-important text-button-primary-text">
              Installed
            </Badge>
          )}
        </div>

        <div className="opacity-65">
          Released: &nbsp;
          {dayjs(version.ReleasedAt).format('MMMM Do, YYYY')}
        </div>

        <Button
          buttonType={cannotInstall ? 'secondary' : 'primary'}
          buttonSize="small"
          onClick={toggleInstallModal}
          disabled={cannotInstall}
          tooltip={!isCompatible ? 'Incompatible' : ''}
        >
          Install
        </Button>
      </div>

      <PluginInstallModal
        show={showInstallModal}
        onClose={toggleInstallModal}
        packageId={manifest.PackageID}
        newPackage={{
          Manifest: manifest,
          Release: version,
        }}
      />
    </>
  );
};

const Package = ({ plugin }: { plugin: PackageManifestInfoType }) => {
  const [showOlderVersions, toggleOlderVersions] = useToggle(false);

  const thumbnailUrl = plugin.Thumbnail ? `/api/v3/Plugin/Package/${plugin.PackageID}/Thumbnail` : null;
  const [latestVersion, ...oldVersions] = plugin.Releases ?? [];

  const installedVersion = find(plugin.Releases, release => release.IsInstalled)?.Version;

  return (
    <div className="flex flex-col gap-y-4 rounded-lg border border-panel-border bg-panel-input p-4">
      <div className="flex gap-x-4">
        <div className="h-24 w-44 shrink-0 rounded-lg">
          {thumbnailUrl
            ? <img src={thumbnailUrl} alt={plugin.Name} className="max-h-24 w-44 rounded-lg object-contain" />
            : <div className="size-full rounded-lg bg-panel-background-alt" />}
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between gap-x-2">
            <div className="text-lg font-semibold">
              {plugin.Name}
            </div>
            {installedVersion && (
              <Badge className="bg-panel-text-important text-button-primary-text">
                {`Installed: ${installedVersion}`}
              </Badge>
            )}
          </div>

          <div className="text-sm opacity-65">
            {plugin.Overview}
          </div>

          <div className="text-xs text-panel-text-important">
            By&nbsp;
            {plugin.Authors}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {map(plugin.Tags, tag => <Badge key={tag} className="bg-panel-background-alt">{tag}</Badge>)}
      </div>

      {latestVersion && <Version manifest={plugin} version={latestVersion} />}

      {oldVersions.length > 0 && (
        <>
          <Button className="-mt-2 flex justify-center text-panel-text-primary" onClick={toggleOlderVersions}>
            {`${showOlderVersions ? 'Hide' : 'Show'} older versions`}
          </Button>

          <AnimateHeight
            height={showOlderVersions ? 'auto' : 0}
            className="-mt-4"
          >
            {/* Scrollbar appears when there are more than 3 entries, the pr-2 is to add some gap between the items and the scrollbar */}
            <div
              className={cx('mt-2 flex max-h-42 flex-col gap-y-2 overflow-y-auto', oldVersions.length > 3 && 'pr-2')}
            >
              {map(oldVersions, version => <Version key={version.Version} manifest={plugin} version={version} />)}
            </div>
          </AnimateHeight>
        </>
      )}
    </div>
  );
};

const BrowseSection = ({ query }: Props) => {
  const manifestsQuery = usePluginPackageManifestsQuery({ pageSize: 0, query });

  if (manifestsQuery.isPending) {
    return (
      <div className="flex grow items-center justify-center text-panel-text-primary">
        <Icon path={mdiLoading} spin size={4} />
      </div>
    );
  }

  if (manifestsQuery.isError) {
    return (
      <div className="flex flex-col gap-y-2 rounded-lg border border-panel-border bg-panel-input p-6">
        <div className="text-lg font-semibold">Catalog unavailable</div>
        <div className="opacity-65">
          The plugin catalog could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      {map(
        manifestsQuery.data?.List,
        pluginPackage => <Package key={pluginPackage.PackageID} plugin={pluginPackage} />,
      )}
    </div>
  );
};

export default BrowseSection;
