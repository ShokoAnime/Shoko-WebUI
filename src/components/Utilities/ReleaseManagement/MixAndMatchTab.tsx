import React, { useMemo, useState } from 'react';
import { mdiAlertOutline, mdiChevronDown, mdiChevronUp, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';

import Button from '@/components/Input/Button';
import { useReleaseOverrideMutation } from '@/core/react-query/release-management/mutations';
import { typeOrder } from '@/core/utilities/buildEpisodeCoverageString';

import type {
  ReleaseCandidateType,
  ReleaseDeletionPreviewType,
  ReleaseOverrideType,
  SeriesWithCandidatesType,
} from '@/core/types/api/release-management';

type FileOption = {
  placeID: number;
  absolutePath: string | null;
  fileSize: number;
  autofillKey: string;
  groupLabel: string;
  version: number;
  isChaptered: boolean | null;
  subtitleStreamCount: number;
  source: string | null;
  resolution: string | null;
};

type EpisodeRow = {
  type: string;
  number: number;
  key: string;
  options: FileOption[];
};

type AutofillGroup = {
  key: string;
  label: string;
};

type Props = {
  series: SeriesWithCandidatesType;
  onPreviewReady: (data: ReleaseDeletionPreviewType) => void;
};

const epKey = (type: string, num: number): string => `${type}:${num}`;

const buildFromOverrides = (overrides: ReleaseOverrideType[]): Map<string, FileOption[]> => {
  const map = new Map<string, FileOption[]>();
  for (const override of overrides) {
    const autofillKey = `${override.GroupID ?? '~'}|${override.Resolution ?? ''}`;
    for (const file of (override.Files ?? [])) {
      for (const episode of (file.Episodes ?? [])) {
        const key = epKey(episode.Type, episode.Number);
        if (!map.has(key)) map.set(key, []);
        const list = map.get(key)!;
        if (!list.some(opt => opt.placeID === file.PlaceID)) {
          list.push({
            placeID: file.PlaceID,
            absolutePath: file.AbsolutePath,
            fileSize: file.FileSize,
            autofillKey,
            groupLabel: override.Name,
            version: file.Version,
            isChaptered: file.IsChaptered,
            subtitleStreamCount: override.SubtitleStreamCount,
            source: override.Source,
            resolution: override.Resolution,
          });
        }
      }
    }
  }
  return map;
};

const buildFromCandidates = (candidates: ReleaseCandidateType[]): Map<string, FileOption[]> => {
  const map = new Map<string, FileOption[]>();
  for (const candidate of candidates) {
    const autofillKey = `${candidate.GroupID ?? '~'}|${candidate.Resolution ?? ''}`;
    for (const file of (candidate.Files ?? [])) {
      for (const episode of (file.Episodes ?? [])) {
        const key = epKey(episode.Type, episode.Number);
        if (!map.has(key)) map.set(key, []);
        const list = map.get(key)!;
        if (!list.some(opt => opt.placeID === file.PlaceID)) {
          list.push({
            placeID: file.PlaceID,
            absolutePath: file.AbsolutePath,
            fileSize: file.FileSize,
            autofillKey,
            groupLabel: candidate.Name,
            version: candidate.Version,
            isChaptered: candidate.IsChaptered,
            subtitleStreamCount: candidate.SubtitleStreamCount,
            source: candidate.Source,
            resolution: candidate.Resolution,
          });
        }
      }
    }
  }
  return map;
};

const deriveAutofillGroups = (
  candidates: ReleaseCandidateType[],
  overrides: ReleaseOverrideType[],
): AutofillGroup[] => {
  const source = overrides.length > 0 ? overrides : candidates;
  const seen = new Set<string>();
  const groups: AutofillGroup[] = [];
  for (const item of source) {
    const key = `${item.GroupID ?? '~'}|${item.Resolution ?? ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      groups.push({ key, label: item.Name });
    }
  }
  return groups;
};

const buildEpisodeRows = (
  candidates: ReleaseCandidateType[],
  overrides: ReleaseOverrideType[],
): EpisodeRow[] => {
  const map = overrides.length > 0
    ? buildFromOverrides(overrides)
    : buildFromCandidates(candidates);
  const rows: EpisodeRow[] = [];
  for (const [key, options] of map) {
    const [type, numStr] = key.split(':');
    rows.push({ type, number: Number(numStr), key, options });
  }
  return rows.sort((rowA, rowB) => {
    const typeA = typeOrder[rowA.type] ?? 99;
    const typeB = typeOrder[rowB.type] ?? 99;
    if (typeA !== typeB) return typeA - typeB;
    return rowA.number - rowB.number;
  });
};

const autoSelectSingleOptions = (rows: EpisodeRow[]): Map<string, number> => {
  const initial = new Map<string, number>();
  for (const episode of rows) {
    if (episode.options.length === 1) initial.set(episode.key, episode.options[0].placeID);
  }
  return initial;
};

const buildOptionSummary = (option: FileOption): string => {
  const parts: string[] = [];
  if (option.isChaptered) parts.push('ch');
  if (option.subtitleStreamCount > 0) {
    parts.push(`${option.subtitleStreamCount} ${option.subtitleStreamCount === 1 ? 'sub' : 'subs'}`);
  }
  if (option.version > 0) parts.push(`v${option.version}`);
  if (option.source) parts.push(option.source);
  if (option.resolution) parts.push(option.resolution);
  return parts.join(' · ');
};

const MixAndMatchTab = ({ onPreviewReady, series }: Props) => {
  const overrides = useMemo(() => series.Overrides ?? [], [series.Overrides]);

  const allEpisodes = useMemo(
    () => buildEpisodeRows(series.Candidates, overrides),
    [series.Candidates, overrides],
  );

  const autofillGroups = useMemo(
    () => deriveAutofillGroups(series.Candidates, overrides),
    [series.Candidates, overrides],
  );

  const [selections, setSelections] = useState<Map<string, number>>(
    () => autoSelectSingleOptions(buildEpisodeRows(series.Candidates, series.Overrides ?? [])),
  );

  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());

  const overrideMutation = useReleaseOverrideMutation(series.SeriesID);

  const toggleEpisode = (key: string) => {
    setExpandedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectOption = (episodeKey: string, placeID: number) => {
    setSelections(prev => new Map(prev).set(episodeKey, placeID));
  };

  const handleAutofill = (groupKey: string) => {
    setSelections((prev) => {
      const next = new Map(prev);
      for (const episode of allEpisodes) {
        if (!next.has(episode.key)) {
          const groupOptions = episode.options.filter(opt => opt.autofillKey === groupKey);
          if (groupOptions.length > 0) {
            const best = [...groupOptions].sort((optA, optB) => optB.version - optA.version)[0];
            next.set(episode.key, best.placeID);
          }
        }
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelections(autoSelectSingleOptions(allEpisodes));
  };

  const unassignedCount = useMemo(
    () => allEpisodes.filter(episode => episode.options.length > 0 && !selections.has(episode.key)).length,
    [allEpisodes, selections],
  );

  const hasGaps = unassignedCount > 0;

  const handlePreview = () => {
    overrideMutation.mutate(
      { selectedPlaceIDs: [...selections.values()] },
      { onSuccess: onPreviewReady },
    );
  };

  if (allEpisodes.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm opacity-65">
        No episodes found across candidates.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm opacity-65">
        Assign one release to each episode. No gaps allowed before previewing.
      </p>

      {/* Autofill buttons + top Preview */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-sm font-semibold">Autofill:</span>
        {autofillGroups.map(group => (
          <Button
            key={group.key}
            buttonType="secondary"
            buttonSize="small"
            onClick={() => handleAutofill(group.key)}
          >
            {group.label}
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button
            buttonType="secondary"
            buttonSize="small"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Button
            buttonType="danger"
            buttonSize="small"
            className="flex items-center gap-x-1"
            onClick={handlePreview}
            disabled={hasGaps || selections.size === 0}
            loading={overrideMutation.isPending}
          >
            <Icon path={mdiTrashCanOutline} size={0.8333} />
            Delete
          </Button>
        </div>
      </div>

      {/* Episode accordion rows */}
      <div className="flex flex-col gap-1.5">
        {allEpisodes.map((episode) => {
          const selectedPlaceID = selections.get(episode.key);
          const selectedOption = episode.options.find(opt => opt.placeID === selectedPlaceID);
          const isExpanded = expandedEpisodes.has(episode.key);
          const isUnassigned = episode.options.length > 0 && !selectedPlaceID;
          const hasNoFiles = episode.options.length === 0;

          const episodeLabel = episode.type === 'Episode'
            ? `Episode ${episode.number}`
            : `${episode.type} ${episode.number}`;

          return (
            <div
              key={episode.key}
              className={cx(
                'overflow-hidden rounded-lg border bg-panel-background',
                isUnassigned ? 'border-panel-text-danger' : 'border-panel-border',
              )}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-panel-background-alt"
                onClick={() => !hasNoFiles && toggleEpisode(episode.key)}
                disabled={hasNoFiles}
              >
                <div className="w-32 shrink-0">
                  <div className="text-sm font-semibold">{episodeLabel}</div>
                  {!hasNoFiles && (
                    <div className="text-xs opacity-50">
                      {episode.options.length}
                      {' '}
                      {episode.options.length === 1 ? 'file' : 'files'}
                    </div>
                  )}
                </div>
                <span className="min-w-0 grow text-sm">
                  {hasNoFiles && (
                    <span className="flex items-center gap-1 text-panel-text-danger">
                      <Icon path={mdiAlertOutline} size={0.6667} />
                      No files available
                    </span>
                  )}
                  {isUnassigned && !hasNoFiles && (
                    <span className="flex items-center gap-1 text-panel-text-danger">
                      <Icon path={mdiAlertOutline} size={0.6667} />
                      Unassigned
                    </span>
                  )}
                  {selectedOption && (
                    <>
                      <span className="font-semibold">{selectedOption.groupLabel}</span>
                      {' '}
                      <span className="opacity-65">
                        —
                        {' '}
                        {buildOptionSummary(selectedOption)}
                        {' '}
                        ·
                        {' '}
                        {prettyBytes(selectedOption.fileSize, { binary: true })}
                      </span>
                    </>
                  )}
                </span>

                {!hasNoFiles && (
                  <Icon
                    path={isExpanded ? mdiChevronUp : mdiChevronDown}
                    size={0.8333}
                    className="shrink-0 opacity-65"
                  />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-panel-border">
                  {episode.options.map((option) => {
                    const isSelected = selectedPlaceID === option.placeID;
                    const fileName = option.absolutePath?.split(/[/\\]/).pop()
                      ?? `Place ${option.placeID}`;
                    const summary = buildOptionSummary(option);

                    return (
                      <button
                        key={option.placeID}
                        type="button"
                        className={cx(
                          'flex w-full items-start gap-3 border-b border-panel-border/50 px-4 py-2.5 text-left text-sm transition-colors last:border-0',
                          isSelected
                            ? 'bg-panel-background-selected-row'
                            : 'hover:bg-panel-background-alt',
                        )}
                        onClick={() => handleSelectOption(episode.key, option.placeID)}
                      >
                        <span className="mt-0.5 shrink-0 text-base leading-none">
                          {isSelected ? '●' : '○'}
                        </span>
                        <div className="min-w-0 grow">
                          <div className="font-semibold">{option.groupLabel}</div>
                          <div className="text-xs opacity-65">{summary}</div>
                          {option.absolutePath != null
                            ? <div className="truncate text-xs opacity-50">{fileName}</div>
                            : <div className="text-xs text-panel-text-warning">Path unavailable</div>}
                        </div>
                        <span className="shrink-0 text-xs opacity-65">
                          {prettyBytes(option.fileSize, { binary: true })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasGaps && (
        <div className="flex items-center gap-2 rounded-lg border border-panel-text-danger bg-panel-text-danger/10 p-3 text-sm text-panel-text-danger">
          <Icon path={mdiAlertOutline} size={0.8333} />
          {unassignedCount === 1 ? '1 episode unassigned.' : `${unassignedCount} episodes unassigned.`}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          buttonType="danger"
          className="flex items-center gap-x-2.5 px-4 py-3 font-semibold"
          onClick={handlePreview}
          disabled={hasGaps || selections.size === 0}
          loading={overrideMutation.isPending}
        >
          <Icon path={mdiTrashCanOutline} size={0.8333} />
          Delete Custom
        </Button>
      </div>

      {overrideMutation.isError && (
        <div className="text-sm text-panel-text-danger">
          Failed to compute custom preview. Please try again.
        </div>
      )}
    </div>
  );
};

export default MixAndMatchTab;
