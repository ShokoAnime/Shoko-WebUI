import React from 'react';
import { mdiAlertOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';

import { Badge } from '@/components/Badge';
import { buildEpisodeCoverageString } from '@/core/utilities/buildEpisodeCoverageString';

import type {
  EpisodeCoverageType,
  ReleaseCandidateFileType,
  ReleaseCandidateType,
} from '@/core/types/api/release-management';

type Props = {
  candidate: ReleaseCandidateType;
  isAiring: boolean;
  isPrimary: boolean;
  primaryEpisodes: EpisodeCoverageType[];
};

const buildFileStreamSummary = (file: ReleaseCandidateFileType): string => {
  const parts: string[] = [];
  if (file.Version > 0) parts.push(`v${file.Version}`);
  if (file.Source) parts.push(file.Source);
  if (file.Resolution) parts.push(file.Resolution);
  if (file.VideoCodec) parts.push(file.VideoCodec);
  if (file.BitDepth > 0 && file.BitDepth !== 8) parts.push(`${file.BitDepth}-bit`);
  if (file.AudioCodec) parts.push(file.AudioCodec);
  return parts.join(', ');
};

const CandidateCardFileList = ({ candidate, isAiring, isPrimary, primaryEpisodes }: Props) => {
  const primaryEpisodeSet = new Set(primaryEpisodes.map(episode => `${episode.Type}:${episode.Number}`));

  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-panel-border pt-3">
      {candidate.Files.map((file) => {
        const fileCoverage = buildEpisodeCoverageString(file.Episodes);
        const fileStreamSummary = buildFileStreamSummary(file);

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

        const isChapteredAnomaly = candidate.IsChapteredMixed && file.IsChaptered !== candidate.IsChaptered;
        const isCensoredAnomaly = candidate.IsCensoredMixed && file.IsCensored !== candidate.IsCensored;
        const isCreditlessAnomaly = candidate.IsCreditlessMixed
          && file.IsCreditless !== candidate.IsCreditless;
        const hasAnomaly = file.IsCorrupted || isChapteredAnomaly || isCensoredAnomaly
          || isCreditlessAnomaly;

        return (
          <div
            key={file.PlaceID}
            className={cx(
              'flex flex-col gap-y-1 rounded-lg border bg-panel-background-alt p-3 text-xs',
              hasAnomaly ? 'border-panel-text-warning/50' : 'border-panel-border',
              file.AbsolutePath == null && 'opacity-65',
            )}
          >
            <div className="flex grow items-center gap-x-2">
              {dirPath && (
                <div className="truncate opacity-65" data-tooltip-id="tooltip" data-tooltip-content={dirPath}>
                  {dirPath}
                </div>
              )}
              <div className="ml-auto shrink-0">
                {fileState === 'redundant' && <span className="text-panel-text-danger">Would be deleted</span>}
                {fileState === 'also-delete' && <span className="opacity-65">Could also delete</span>}
                {fileState === 'kept' && <span className="opacity-65">Kept</span>}
                {fileState === 'required' && <span className="text-panel-text-warning">Required - no other copy</span>}
                {fileState === 'unknown' && (
                  <span
                    className="flex items-center gap-1 text-panel-text-warning"
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Coverage cannot be determined  -  file is unrecognized"
                  >
                    <Icon path={mdiAlertOutline} size={0.6667} />
                    Unknown coverage
                  </span>
                )}
              </div>
            </div>

            <div className="truncate text-sm font-semibold" data-tooltip-id="tooltip" data-tooltip-content={fileName}>
              {fileName}
            </div>

            <div className="flex flex-wrap gap-x-4 opacity-65">
              {fileCoverage && <span>{fileCoverage}</span>}
              <span>{prettyBytes(file.FileSize, { binary: true })}</span>
              {!file.AbsolutePath && <span className="text-panel-text-warning">Path unavailable</span>}
            </div>

            {fileStreamSummary && <div className="opacity-65">{fileStreamSummary}</div>}

            {(file.AudioLanguages.length > 0 || file.SubtitleLanguages.length > 0) && (
              <div className="opacity-65">
                {file.AudioLanguages.length > 0 && `Audio: ${file.AudioLanguages.join(', ')}`}
                {file.AudioLanguages.length > 0 && file.SubtitleLanguages.length > 0 && ', '}
                {file.SubtitleLanguages.length > 0 && `Subs: ${file.SubtitleLanguages.join(', ')}`}
              </div>
            )}

            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
              {file.IsChaptered != null && (file.IsChaptered || isChapteredAnomaly) && (
                <Badge
                  className={cx(
                    isChapteredAnomaly
                      ? 'bg-panel-text-warning/10 text-panel-text-warning'
                      : 'bg-panel-background-alt',
                  )}
                >
                  {isChapteredAnomaly && <Icon path={mdiAlertOutline} size={0.5833} />}
                  {file.IsChaptered ? 'Chaptered' : 'Unchaptered'}
                </Badge>
              )}

              {file.IsCensored && (
                <Badge className="bg-panel-text-warning/10 text-panel-text-warning">
                  {isCensoredAnomaly && <Icon path={mdiAlertOutline} size={0.5833} />}
                  Censored
                </Badge>
              )}

              {file.IsCreditless && (
                <Badge
                  className={cx(
                    isCreditlessAnomaly
                      ? 'bg-panel-text-warning/10 text-panel-text-warning'
                      : 'bg-panel-background-alt',
                  )}
                >
                  Creditless
                </Badge>
              )}

              {file.IsCorrupted && (
                <Badge className="bg-panel-text-danger/10 text-panel-text-danger">
                  <Icon path={mdiAlertOutline} size={0.5833} />
                  Corrupted
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateCardFileList;
