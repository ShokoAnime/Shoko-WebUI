import React, { useState } from 'react';
import { mdiAlertOutline, mdiChevronDown, mdiChevronUp, mdiFlagOutline, mdiStar, mdiSwapVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import { buildEpisodeCoverageString, buildEpisodeSet } from '@/core/utilities/buildEpisodeCoverageString';

import type { EpisodeCoverageType, ReleaseCandidateType } from '@/core/types/api/release-management';

type Props = {
  candidate: ReleaseCandidateType;
  primaryEpisodes: EpisodeCoverageType[];
  isAiring: boolean;
  isPrimary: boolean;
  isOverrideActive: boolean;
  isPartial?: boolean;
  onSelectAsPrimary: () => void;
  onViewMixMatch?: () => void;
  onMarkAllAsVariations?: () => void;
};

const parseMixedFlag = (
  value: boolean | null,
  isMixed: boolean,
  trueLabel: string,
  falseLabel: string,
): string => {
  if (value == null) return 'N/A';
  if (isMixed) return value ? `Mostly ${trueLabel}` : `Mostly ${falseLabel}`;
  return value ? 'Yes' : 'No';
};

const CandidateCard = ({
  candidate,
  isAiring,
  isOverrideActive,
  isPartial = false,
  isPrimary,
  onMarkAllAsVariations,
  onSelectAsPrimary,
  onViewMixMatch,
  primaryEpisodes,
}: Props) => {
  const [filesExpanded, setFilesExpanded] = useState(false);

  const primaryEpisodeSet = buildEpisodeSet(primaryEpisodes);

  const coverageString = buildEpisodeCoverageString(candidate.Episodes);
  const totalSize = candidate.Files.reduce((sum, file) => sum + file.FileSize, 0);
  const redundantFileCount = candidate.Files.filter(file => file.IsRedundant).length;

  const isVersion = candidate.DecidingSignal === 'Version';
  const hasFiles = candidate.Files.length > 0;

  const groupLabel = candidate.Name;

  const strategyLabel = ((): string | null => {
    if (candidate.VersionStrategy === 'Consistent') return `v${candidate.Version} Consistent`;
    if (candidate.VersionStrategy === 'BestAvailable') {
      return candidate.Version > 1 ? `Best Available (up to v${candidate.Version})` : 'Best Available';
    }
    return null;
  })();

  return (
    <div
      className={cx(
        'flex flex-col gap-3 rounded-lg border bg-panel-background-alt p-4',
        isPrimary ? 'border-panel-text-primary' : 'border-panel-border',
        hasFiles && 'cursor-pointer',
      )}
      onClick={hasFiles ? () => setFilesExpanded(prev => !prev) : undefined}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        {isPrimary && <Icon path={mdiStar} size={0.8333} className="shrink-0 text-panel-text-primary" />}
        <span className="font-semibold">
          Rank&nbsp;
          {candidate.Rank}
        </span>
        <span className="font-semibold text-panel-text-important">
          {groupLabel}
        </span>
        {candidate.IsMixed && <Badge className="bg-panel-background-alt text-panel-text">MIXED</Badge>}
        {strategyLabel && <Badge className="bg-panel-background-alt text-panel-text">{strategyLabel}</Badge>}
        {isVersion && candidate.WinnerValue && candidate.LoserValue && (
          <Badge className="bg-panel-background-alt">
            v{candidate.LoserValue}&nbsp;→&nbsp;v{candidate.WinnerValue}
          </Badge>
        )}
        {!candidate.HasReleaseInfo && (
          <Icon
            path={mdiAlertOutline}
            size={0.8333}
            className="shrink-0 text-panel-text-warning"
            data-tooltip-id="tooltip"
            data-tooltip-content="Quality signals incomplete — some files are unrecognized"
          />
        )}
        {isPartial
          ? (
            <Badge className="bg-panel-text-warning/20 text-panel-text-warning">
              ⚠ PARTIAL
            </Badge>
          )
          : !isPrimary && (
            candidate.IsRedundant
              ? (
                <Badge className="bg-panel-text-danger text-button-primary-text">
                  Would be deleted
                </Badge>
              )
              : (
                <Badge className="bg-panel-background-alt text-panel-text">
                  No auto-delete available
                </Badge>
              )
          )}

        <div className="ml-auto flex items-center gap-2">
          {!isPrimary && !isPartial && (
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex items-center gap-x-1"
              onClick={(event) => {
                event.stopPropagation();
                onSelectAsPrimary();
              }}
              tooltip={isOverrideActive ? 'Currently selected as primary' : 'Select as primary'}
            >
              <Icon path={mdiSwapVertical} size={0.8333} />
              {isOverrideActive ? 'Primary (override)' : 'Select as primary'}
            </Button>
          )}
          {onMarkAllAsVariations && hasFiles && (
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex items-center gap-x-1"
              onClick={(event) => {
                event.stopPropagation();
                onMarkAllAsVariations();
              }}
              tooltip="Mark all files in this candidate as variations"
            >
              <Icon path={mdiFlagOutline} size={0.8333} />
              Mark all as Variations
            </Button>
          )}
          {hasFiles && (
            <Icon
              path={filesExpanded ? mdiChevronUp : mdiChevronDown}
              size={0.8333}
              className="opacity-65"
            />
          )}
        </div>
      </div>

      {/* Deciding signal */}
      {!isPrimary && candidate.DecidingSignal && candidate.WinnerValue && candidate.LoserValue && (
        <div className="text-sm opacity-65">
          Ranked lower by:&nbsp;
          <span className="font-semibold">{candidate.DecidingSignal}</span>
          &nbsp;(
          {isVersion ? 'v' : ''}
          {candidate.WinnerValue}
          &nbsp;&gt;&nbsp;
          {isVersion ? 'v' : ''}
          {candidate.LoserValue}
          )
        </div>
      )}

      {/* Quality signals grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <div>
          Source:&nbsp;
          <span className="font-semibold">{candidate.Source ?? 'Unknown'}</span>
        </div>
        <div>
          Resolution:&nbsp;
          <span className="font-semibold">{candidate.Resolution ?? 'Unknown'}</span>
        </div>
        <div>
          Video:&nbsp;
          <span className="font-semibold">{candidate.VideoCodec ?? 'Unknown'}</span>
        </div>
        <div>
          Bit Depth:&nbsp;
          <span className="font-semibold">
            {candidate.BitDepth > 0 ? `${candidate.BitDepth}-bit` : 'Unknown'}
          </span>
        </div>
        <div>
          Audio:&nbsp;
          <span className="font-semibold">{candidate.AudioCodec ?? 'Unknown'}</span>
        </div>
        <div>
          Audio Streams:&nbsp;
          <span className="font-semibold">{candidate.AudioStreamCount}</span>
        </div>
        <div>
          Subtitle Streams:&nbsp;
          <span className="font-semibold">{candidate.SubtitleStreamCount}</span>
        </div>
        <div>
          Version:&nbsp;
          <span className="font-semibold">
            v
            {candidate.Version > 0 ? candidate.Version : 1}
          </span>
        </div>
        <div>
          Chaptered:&nbsp;
          <span className="font-semibold">
            {parseMixedFlag(candidate.IsChaptered, candidate.IsChapteredMixed, 'Chaptered', 'Unchaptered')}
          </span>
        </div>
        <div>
          Censored:&nbsp;
          <span
            className={cx(
              'font-semibold',
              candidate.IsCensored && !candidate.IsCensoredMixed && 'text-panel-text-warning',
            )}
          >
            {parseMixedFlag(candidate.IsCensored, candidate.IsCensoredMixed, 'Censored', 'Uncensored')}
          </span>
        </div>
        <div>
          Creditless:&nbsp;
          <span className="font-semibold">
            {parseMixedFlag(candidate.IsCreditless, candidate.IsCreditlessMixed, 'Creditless', 'Not Creditless')}
          </span>
        </div>
        {candidate.IsCorrupted && <div className="font-semibold text-panel-text-danger">Corrupted</div>}
      </div>

      {/* Languages */}
      {((candidate.AudioLanguages?.length ?? 0) > 0 || (candidate.SubtitleLanguages?.length ?? 0) > 0) && (
        <div className="grid grid-cols-2 gap-x-6 text-sm">
          {(candidate.AudioLanguages?.length ?? 0) > 0 && (
            <div>
              Audio Languages:&nbsp;
              <span className="font-semibold">{candidate.AudioLanguages!.join(', ')}</span>
            </div>
          )}
          {(candidate.SubtitleLanguages?.length ?? 0) > 0 && (
            <div>
              Subtitle Languages:&nbsp;
              <span className="font-semibold">{candidate.SubtitleLanguages!.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Episode coverage + file summary */}
      <div className="border-t border-panel-border pt-3 text-sm">
        <div>
          Coverage:&nbsp;
          <span className="font-semibold">{coverageString !== '' ? coverageString : 'None'}</span>
        </div>
        {isPartial && onViewMixMatch && (
          <div className="mt-1 flex items-center gap-1 text-xs text-panel-text-warning">
            <Icon path={mdiAlertOutline} size={0.6667} />
            Partial coverage — some episodes missing.&nbsp;
            <button
              type="button"
              className="underline hover:opacity-80"
              onClick={(event) => {
                event.stopPropagation();
                onViewMixMatch();
              }}
            >
              View in Mix &amp; Match →
            </button>
          </div>
        )}
        <div className="mt-1">
          Files:&nbsp;
          <span className="font-semibold">{candidate.Files.length}</span>
          {candidate.IsRedundant && (
            <>
              &nbsp;(
              <span className="text-panel-text-danger">
                {redundantFileCount} to delete
              </span>
              )
            </>
          )}
          &nbsp;·&nbsp;
          <span className="font-semibold">{prettyBytes(totalSize, { binary: true })}</span>
        </div>
      </div>

      {/* File list */}
      {filesExpanded && (
        <div className="flex flex-col gap-2 border-t border-panel-border pt-3">
          {candidate.Files.map((file) => {
            const fileCoverage = buildEpisodeCoverageString(file.Episodes);

            let fileState: 'redundant' | 'kept' | 'also-delete' | 'required' | 'unknown';
            if (isPrimary) {
              fileState = 'kept';
            } else if (isAiring) {
              fileState = file.IsRedundant ? 'redundant' : 'kept';
            } else if (candidate.IsRedundant) {
              fileState = 'redundant';
            } else if (file.Episodes.length === 0) {
              fileState = 'unknown';
            } else {
              const allCovered = file.Episodes.every(
                episode => primaryEpisodeSet.has(`${episode.Type}:${episode.Number}`),
              );
              fileState = allCovered ? 'also-delete' : 'required';
            }

            const pathParts = file.AbsolutePath?.split(/[/\\]/) ?? [];
            const fileName = pathParts.at(-1) ?? `Place ${file.PlaceID}`;
            const dirPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : null;

            const fileAnomalies: string[] = [];
            if (file.IsCorrupted) fileAnomalies.push('Corrupted');
            if (candidate.IsChapteredMixed && file.IsChaptered !== candidate.IsChaptered) {
              fileAnomalies.push(file.IsChaptered ? 'Chaptered' : 'Unchaptered');
            }
            if (candidate.IsCensoredMixed && file.IsCensored !== candidate.IsCensored) {
              fileAnomalies.push(file.IsCensored ? 'Censored' : 'Uncensored');
            }
            if (candidate.IsCreditlessMixed && file.IsCreditless !== candidate.IsCreditless) {
              fileAnomalies.push(file.IsCreditless ? 'Creditless' : 'Credited');
            }

            return (
              <div
                key={file.PlaceID}
                className={cx(
                  'flex items-start gap-3 rounded-lg border bg-panel-background p-3 text-sm',
                  fileAnomalies.length > 0 ? 'border-panel-text-warning/50' : 'border-panel-border',
                  file.AbsolutePath == null && 'opacity-65',
                )}
              >
                <div className="flex min-w-0 grow flex-col gap-1">
                  {dirPath && <div className="truncate text-xs opacity-65">{dirPath}</div>}
                  <div className="truncate font-semibold">{fileName}</div>
                  <div className="flex flex-wrap gap-x-4 text-xs opacity-65">
                    {fileCoverage && <span>{fileCoverage}</span>}
                    <span>{prettyBytes(file.FileSize, { binary: true })}</span>
                    {file.AbsolutePath == null && <span className="text-panel-text-warning">Path unavailable</span>}
                  </div>
                  {(file.AudioLanguages.length > 0 || file.SubtitleLanguages.length > 0) && (
                    <div className="text-xs opacity-65">
                      {file.AudioLanguages.length > 0 && `Audio: ${file.AudioLanguages.join(', ')}`}
                      {file.AudioLanguages.length > 0 && file.SubtitleLanguages.length > 0 && ' · '}
                      {file.SubtitleLanguages.length > 0 && `Subs: ${file.SubtitleLanguages.join(', ')}`}
                    </div>
                  )}
                  {fileAnomalies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {fileAnomalies.map(anomaly => (
                        <span
                          key={anomaly}
                          className="flex items-center gap-1 rounded-sm bg-panel-text-warning/15 px-1.5 py-0.5 text-xs font-semibold text-panel-text-warning"
                        >
                          <Icon path={mdiAlertOutline} size={0.5833} />
                          {anomaly}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {fileState === 'redundant' && (
                    <span className="text-xs text-panel-text-danger">Would be deleted</span>
                  )}
                  {fileState === 'also-delete' && <span className="text-xs opacity-65">Could also delete</span>}
                  {fileState === 'kept' && <span className="text-xs opacity-65">Kept</span>}
                  {fileState === 'required' && (
                    <span className="text-xs text-panel-text-warning">Required — no other copy</span>
                  )}
                  {fileState === 'unknown' && (
                    <span
                      className="flex items-center gap-1 text-xs text-panel-text-warning"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Coverage cannot be determined — file is unrecognized"
                    >
                      <Icon path={mdiAlertOutline} size={0.6667} />
                      Unknown coverage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
