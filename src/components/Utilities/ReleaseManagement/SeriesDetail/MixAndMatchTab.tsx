import { useEffect } from 'react';
import { mdiAlertOutline, mdiCheckboxMarkedCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { typeOrder } from '@/core/utilities/releaseManagementHelpers';

import { MixAndMatchEpisode } from './MixAndMatchEpisode';

import type { EpisodeRow, FileOption } from './MixAndMatchEpisode';
import type {
  ReleaseCandidateType,
  ReleaseOverrideType,
  SeriesWithCandidatesType,
} from '@/core/types/api/release-management';
import type { Updater } from 'use-immer';

type AutofillGroup = {
  key: string;
  label: string;
};

type Props = {
  selection: Map<string, number>;
  series: SeriesWithCandidatesType;
  setSelection: Updater<Map<string, number>>;
  setUnassignedCount: (count: number) => void;
};

const epKey = (type: string, num: number): string => `${type}:${num}`;

/** Returns a map of auto-selected defaults: episodes with exactly one file option get that option pre-selected. */
const getDefaultSelections = (rows: EpisodeRow[]) => {
  const initial = new Map<string, number>();
  for (const episode of rows) {
    if (episode.options.length === 1) initial.set(episode.key, episode.options[0].placeID);
  }
  return initial;
};

const buildEpisodeMap = (items: ReleaseCandidateType[] | ReleaseOverrideType[]) => {
  const map = new Map<string, FileOption[]>();
  for (const item of items) {
    const autofillKey = `${item.GroupID ?? '~'}|${item.Resolution ?? ''}`;
    for (const file of item.Files) {
      for (const episode of file.Episodes) {
        const key = epKey(episode.Type, episode.Number);
        if (!map.has(key)) map.set(key, []);
        const list = map.get(key)!;
        if (!list.some(opt => opt.placeID === file.PlaceID)) {
          list.push({
            placeID: file.PlaceID,
            absolutePath: file.AbsolutePath,
            fileSize: file.FileSize,
            autofillKey,
            groupLabel: item.Name,
            version: file.Version,
            isChaptered: file.IsChaptered,
            // OverrideFileType (used for partial-coverage groups) has no IsVariation field.
            isVariation: 'IsVariation' in file && file.IsVariation,
            releasedAt: file.ReleasedAt,
            importedAt: file.ImportedAt,
            originalFilename: file.OriginalFilename,
            subtitleStreamCount: item.SubtitleStreamCount,
            source: item.Source,
            resolution: item.Resolution,
            videoCodec: item.VideoCodec,
            bitDepth: item.BitDepth,
            audioCodec: item.AudioCodec,
            audioLanguages: item.AudioLanguages ?? [],
            subtitleLanguages: item.SubtitleLanguages ?? [],
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
  const map = buildEpisodeMap(overrides.length > 0 ? overrides : candidates);
  const rows: EpisodeRow[] = [];
  for (const [key, options] of map) {
    const [type, numStr] = key.split(':');
    rows.push({ type, number: Number(numStr), key, options });
  }
  return rows.sort((rowA, rowB) => {
    // Episodes with 2+ options come first, single-option episodes last
    const multiA = rowA.options.length > 1 ? 0 : 1;
    const multiB = rowB.options.length > 1 ? 0 : 1;
    if (multiA !== multiB) return multiA - multiB;

    const typeA = typeOrder[rowA.type] ?? 99;
    const typeB = typeOrder[rowB.type] ?? 99;
    if (typeA !== typeB) return typeA - typeB;
    return rowA.number - rowB.number;
  });
};

const MixAndMatchTab = ({ selection, series, setSelection, setUnassignedCount }: Props) => {
  const overrides = series.Overrides;
  const allEpisodes = buildEpisodeRows(series.Candidates, overrides);
  const autofillGroups = deriveAutofillGroups(series.Candidates, overrides);

  useEffect(() => {
    setSelection(getDefaultSelections(allEpisodes));
    return () => {
      setSelection(new Map());
    };
  }, [allEpisodes, setSelection]);

  const handleSelectOption = (episodeKey: string, placeID: number) => {
    setSelection((draft) => {
      draft.set(episodeKey, placeID);
    });
  };

  const handleAutofill = (groupKey: string) => {
    setSelection((draft) => {
      for (const episode of allEpisodes) {
        const groupOptions = episode.options.filter(opt => opt.autofillKey === groupKey);
        if (groupOptions.length > 0) {
          const best = [...groupOptions].sort((optA, optB) => optB.version - optA.version)[0];
          draft.set(episode.key, best.placeID);
        }
      }
    });
  };

  const handleClearAll = () => {
    setSelection(getDefaultSelections(allEpisodes));
  };

  const unassignedCount = allEpisodes.length - selection.size;

  useEffect(() => {
    setUnassignedCount(unassignedCount);
  }, [setUnassignedCount, unassignedCount]);

  if (allEpisodes.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        No episodes found across candidates.
      </div>
    );
  }

  return (
    <div className="flex grow flex-col gap-y-4 overflow-y-auto">
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
        </div>
      </div>

      <div
        className={cx(
          'flex items-center gap-x-2 rounded-lg border p-3 text-sm font-semibold transition-colors',
          unassignedCount > 0
            ? 'border-panel-text-danger bg-panel-text-danger/10 text-panel-text-danger'
            : 'border-panel-text-primary text-panel-text-primary',
        )}
      >
        <Icon path={unassignedCount > 0 ? mdiAlertOutline : mdiCheckboxMarkedCircleOutline} size={0.8333} />
        {unassignedCount > 0
          ? `${unassignedCount} ${
            unassignedCount === 1 ? 'episode' : 'episodes'
          } unassigned. Assign one release to each episode. No gaps allowed before previewing.`
          : 'All episodes assigned'}
      </div>

      {/* Episode accordion rows */}
      <div className="flex grow flex-col gap-y-2 overflow-y-auto pr-2 contain-strict">
        {allEpisodes.map(episode => (
          <MixAndMatchEpisode
            key={episode.key}
            episode={episode}
            selectedPlaceID={selection.get(episode.key)}
            onSelectOption={handleSelectOption}
          />
        ))}
      </div>
    </div>
  );
};

export default MixAndMatchTab;
