import React from 'react';
import cx from 'classnames';

import { ReleaseSource } from '@/core/types/api/file';

import LinkFilesTabCrossReference from './LinkFilesTabCrossReference';

import type { AniDBEpisodeType } from '@/core/types/api/episode';
import type { SeriesAniDBSearchResult } from '@/core/types/api/series';
import type { ManualLink } from '@/pages/utilities/UnrecognizedUtilityTabs/LinkFilesTab';

export type LinksFilesTab2FileProps = {
  link: ManualLink;
  animeRecord: Record<number, SeriesAniDBSearchResult | null>;
  episodeRecord: Record<number, AniDBEpisodeType | null>;
  selectLink: (event: React.MouseEvent<HTMLElement>) => void;
  selectedLinkDict: Record<number, boolean>;
  focusedLink: boolean;
};

function parseProviderName(providerName: string, state: ManualLink['state'] | 'can-submit'): React.ReactNode {
  if (providerName === 'User' || state === 'search-queue' || state === 'searching') {
    return null;
  }
  if (providerName.endsWith('+User')) {
    return (
      <span className="text-sm font-semibold">
        {providerName.slice(0, -5)}
        <span className="opacity-65">(Edited by User)</span>
      </span>
    );
  }
  return (
    <span className="text-sm font-semibold">
      {providerName}
    </span>
  );
}

function parseLinkState(state: ManualLink['state'] | 'can-submit'): React.ReactNode {
  switch (state) {
    case 'can-submit':
      return (
        <span className="text-panel-text-important">
          Ready for Submission
        </span>
      );
    case 'init':
      return (
        <span className="opacity-65">
          Initial State
        </span>
      );
    case 'pending':
      return (
        <span className="text-panel-text-warning">
          Missing Episodes
        </span>
      );
    case 'search-queue':
      return (
        <span className="opacity-65">
          In Search Queue
        </span>
      );
    case 'searching':
      return (
        <span className="text-panel-text-primary">
          Searching for a Match
        </span>
      );
    case 'submit-queue':
      return (
        <span className="opacity-65">
          In Submit Queue
        </span>
      );
    case 'submitting':
      return (
        <span className="text-panel-text-primary">
          Submitting Match
        </span>
      );
    case 'submitted':
      return (
        <span className="text-panel-text-important">
          Completed
        </span>
      );
    default:
      return (
        <span className="text-panel-text-warning">
          {state}
        </span>
      );
  }
}

function parseReleaseSource(releaseSource: ReleaseSource): string {
  switch (releaseSource) {
    case ReleaseSource.BluRay:
      return 'Blu-Ray';
    default:
      return releaseSource;
  }
}

function LinkFilesTabVideo(props: LinksFilesTab2FileProps): React.JSX.Element {
  const {
    animeRecord: animeDict,
    episodeRecord: episodeDict,
    focusedLink: isInFocus,
    link,
    selectLink,
    selectedLinkDict,
  } = props;
  const { file } = link;
  const path = file.Locations[0]?.RelativePath ?? '';
  const match = /[/\\](?=[^/\\]*$)/g.exec(path);
  const relativePath = match ? path?.substring(0, match.index) : 'Root Level';
  const isSelected = selectedLinkDict[link.id] ?? false;
  let linkState: ManualLink['state'] | 'can-submit' = link.state;
  if (link.state === 'pending' && link.release.CrossReferences.length > 0) {
    linkState = 'can-submit';
  }
  let border = '' as string;
  if (!isInFocus) {
    if (isSelected) {
      if (!(linkState === 'searching' || linkState === 'submitting' || linkState === 'submitted')) {
        border = 'border-panel-text-primary';
      } else if (linkState === 'submitted') {
        border = 'border-panel-text-important';
      }
    } else if (linkState === 'searching' || linkState === 'submitting') {
      border = 'border-panel-text-primary';
    } else if (linkState === 'submitted') {
      border = 'border-panel-text-important';
    } else {
      border = 'border-panel-border';
    }
  }

  return (
    <div
      data-video-link-id={link.id}
      data-type="video-link"
      key={link.id}
      className={cx(
        'col-start-1 flex w-full flex-col gap-y-2 rounded-lg p-4 border leading-5 transition-colors',
        border,
        isSelected && !(linkState === 'submitting' || linkState === 'searching' || linkState === 'submitted')
          && 'bg-panel-background-selected-row cursor-pointer',
        isSelected && (linkState === 'submitting' || linkState === 'searching')
          && 'bg-panel-background-selected-row cursor-pointer',
        isSelected && linkState === 'submitted' && 'bg-panel-background-selected-row cursor-pointer',
        !isSelected && linkState === 'init' && 'bg-panel-background cursor-pointer',
        !isSelected && linkState === 'pending' && 'bg-panel-background cursor-pointer',
        !isSelected && linkState === 'can-submit' && 'bg-panel-background-alt cursor-pointer',
        !isSelected && linkState === 'search-queue'
          && 'opacity-65 bg-panel-background-alt cursor-pointer animate-pulse',
        !isSelected && linkState === 'searching' && 'bg-panel-background-alt cursor-progress',
        !isSelected && linkState === 'submit-queue' && 'opacity-65 bg-panel-background-alt cursor-wait',
        !isSelected && linkState === 'submitting' && 'bg-panel-background-alt cursor-progress',
        !isSelected && linkState === 'submitted' && 'bg-panel-background',
      )}
      onClick={selectLink}
      data-id={link.id}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 -ml-1 flex w-full flex-row place-items-center gap-x-2 border-b border-panel-border pb-1">
          <div className="flex grow flex-col">
            <span className="line-clamp-1">
              {[
                parseLinkState(linkState),
                parseProviderName(link.release.ProviderName, linkState),
              ].filter(node => node != null).flatMap((node, index) => [
                index > 0 ? ' - ' : null,
                node,
              ])}
            </span>
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-row place-items-center gap-x-2 lg:col-span-1">
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
        <div className="col-span-2 -mt-1 grid shrink-0 grow-0 grid-cols-2 flex-row gap-x-1 overflow-auto border-l-0 border-t border-panel-border pt-1 lg:col-span-1 lg:-ml-1 lg:-mt-0 lg:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-1 lg:pt-0">
          <span className="col-span-1">
            Group:&nbsp;
            {link.release.Group && (
              <span className="text-sm font-semibold opacity-65">
                {link.release.Group.Name}
                (
                {link.release.Group.Source}
                )
              </span>
            )}
            {!link.release.Group && (
              <span className="text-sm font-semibold opacity-65">
                Unknown
              </span>
            )}
          </span>
          <span className="col-span-1">
            Version:&nbsp;
            {link.release.Revision}
          </span>
          <span className="col-span-1">
            Comment:&nbsp;
            {link.release.Comment ?? '-'}
          </span>
          <span className="col-span-1">
            Chaptered:&nbsp;
            {link.release.IsChaptered == null && 'N/A'}
            {link.release.IsChaptered === true && 'Yes'}
            {link.release.IsChaptered === false && 'No'}
          </span>
          <span className="col-span-1">
            Creditless:&nbsp;
            {link.release.IsCreditless == null && 'N/A'}
            {link.release.IsCreditless === true && 'Yes'}
            {link.release.IsCreditless === false && 'No'}
          </span>
          <span className="col-span-1">
            Censored:&nbsp;
            {link.release.IsCensored == null && 'N/A'}
            {link.release.IsCensored === true && 'Yes'}
            {link.release.IsCensored === false && 'No'}
          </span>
          <span className="col-span-1">
            Corrupted:&nbsp;
            {link.release.IsCorrupted ? 'Yes' : 'No'}
          </span>
          <span className="col-span-1">
            Source:&nbsp;
            {parseReleaseSource(link.release.Source)}
          </span>
          <span className="col-span-1">
            Released at:&nbsp;
            {link.release.Released}
          </span>
        </div>
        <div className="col-span-2 -mt-1 flex flex-col border-t border-panel-border pt-1">
          {link.release.CrossReferences.length > 0
            ? (
              link.release.CrossReferences.map(xref => (
                <LinkFilesTabCrossReference
                  key={`${xref.AnidbEpisodeID}-${xref.AnidbAnimeID}-${xref.PercentageStart}-${xref.PercentageEnd}`}
                  xref={xref}
                  anime={animeDict[xref.AnidbAnimeID ?? -1] ?? null}
                  episode={episodeDict[xref.AnidbEpisodeID] ?? null}
                />
              ))
            )
            : (
              <span className="text-sm font-semibold">
                Not Yet Linked
              </span>
            )}
        </div>
      </div>
    </div>
  );
}

export default LinkFilesTabVideo;
