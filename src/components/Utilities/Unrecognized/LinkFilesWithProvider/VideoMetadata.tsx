import React from 'react';

import { ReleaseSource } from '@/core/types/api/file';

import type { ManualLinkType } from '@/core/types/utilities/unrecognized-utility';

const parseReleaseSource = (releaseSource: ReleaseSource) => {
  switch (releaseSource) {
    case ReleaseSource.BluRay:
      return 'Blu-Ray';
    default:
      return releaseSource;
  }
};

const VideoMetadata = ({ link }: { link: ManualLinkType }) => {
  const { file } = link;
  const path = file.Locations[0]?.RelativePath ?? '';
  const match = /[/\\](?=[^/\\]*$)/g.exec(path);
  const relativePath = match ? path?.substring(0, match.index) : 'Root Level';

  return (
    <div className="flex flex-col gap-2 border-t border-b border-panel-border text-sm">
      <div className="flex items-center pt-2">
        <div
          className="flex flex-col"
          data-tooltip-id="tooltip"
          data-tooltip-content={path}
          data-tooltip-delay-show={500}
        >
          <span className="line-clamp-1 text-sm font-semibold opacity-65">
            {relativePath}
          </span>
          <span className="line-clamp-1">
            {path?.split(/[/\\]/g).pop()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 overflow-auto py-2 border-t border-panel-border gap-y-1">
        <div className="font-semibold">
          Group:&nbsp;
          {link.release.Group ? `${link.release.Group.Name} (${link.release.Group.Source})` : 'Unknown'}
        </div>

        <div>
          Version:&nbsp;
          {link.release.Version}
        </div>

        <div>
          Chaptered:&nbsp;
          {link.release.IsChaptered == null && 'N/A'}
          {link.release.IsChaptered === true && 'Yes'}
          {link.release.IsChaptered === false && 'No'}
        </div>

        <div>
          Creditless:&nbsp;
          {link.release.IsCreditless == null && 'N/A'}
          {link.release.IsCreditless === true && 'Yes'}
          {link.release.IsCreditless === false && 'No'}
        </div>

        <div>
          Censored:&nbsp;
          {link.release.IsCensored == null && 'N/A'}
          {link.release.IsCensored === true && 'Yes'}
          {link.release.IsCensored === false && 'No'}
        </div>

        <div>
          Corrupted:&nbsp;
          {link.release.IsCorrupted ? 'Yes' : 'No'}
        </div>

        <div>
          Source:&nbsp;
          {parseReleaseSource(link.release.Source)}
        </div>

        <div>
          Released on:&nbsp;
          {link.release.Released}
        </div>

        <div>
          Comment:&nbsp;
          {link.release.Comment ?? '-'}
        </div>
      </div>
    </div>
  );
};

export default VideoMetadata;
