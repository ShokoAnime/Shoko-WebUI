import React from 'react';
import { mdiAlertOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import { buildEpisodeSet } from '@/core/utilities/buildEpisodeCoverageString';

import CandidateCard from './CandidateCard';

import type {
  EpisodeCoverageType,
  ReleaseCandidateType,
  SeriesWithCandidatesType,
} from '@/core/types/api/release-management';

type Props = {
  series: SeriesWithCandidatesType;
  overrides: Map<number, string>;
  onOverrideChange: (seriesId: number, candidateKey: string) => void;
  onPreviewSingle: () => void;
  onViewMixMatch: () => void;
  onMarkAllAsVariations?: (videoLocalIds: number[]) => void;
};

const computeEffectivePrimary = (
  candidates: ReleaseCandidateType[],
  overrideKey: string | undefined,
): ReleaseCandidateType => {
  if (overrideKey) {
    const override = candidates.find(candidate => candidate.Key === overrideKey);
    if (override) return override;
  }
  return candidates[0];
};

const isSubsetOf = (subset: EpisodeCoverageType[], superset: Set<string>): boolean =>
  subset.every(episode => superset.has(`${episode.Type}:${episode.Number}`));

const CandidatesTab = ({
  onMarkAllAsVariations,
  onOverrideChange,
  onPreviewSingle,
  onViewMixMatch,
  overrides,
  series,
}: Props) => {
  const overrideKey = overrides.get(series.SeriesID);
  const effectivePrimary = computeEffectivePrimary(series.Candidates, overrideKey);
  const primaryEpisodeSet = buildEpisodeSet(effectivePrimary?.Episodes ?? []);

  // All episode keys that appear in any non-partial candidate (union for partial detection)
  const fullEpisodeSet = (() => {
    const set = new Set<string>();
    for (const candidate of series.Candidates) {
      if (!candidate.IsPartial) {
        for (const episode of candidate.Episodes) set.add(`${episode.Type}:${episode.Number}`);
      }
    }
    // Fall back to all candidates if none are marked non-partial
    if (set.size === 0) {
      for (const candidate of series.Candidates) {
        for (const episode of candidate.Episodes) set.add(`${episode.Type}:${episode.Number}`);
      }
    }
    return set;
  })();

  const isPartialCandidate = (candidate: ReleaseCandidateType): boolean => {
    if (candidate.IsPartial) return true;
    if (fullEpisodeSet.size === 0) return false;
    const candidateKeys = new Set(candidate.Episodes.map(episode => `${episode.Type}:${episode.Number}`));
    return ![...fullEpisodeSet].every(key => candidateKeys.has(key));
  };

  // Recompute redundancy locally when an override is active
  const candidatesWithRedundancy = overrideKey
    ? series.Candidates.map((candidate) => {
      if (candidate.Key === effectivePrimary?.Key) return { ...candidate, IsRedundant: false };
      const redundant = isSubsetOf(candidate.Episodes, primaryEpisodeSet);
      return { ...candidate, IsRedundant: redundant };
    })
    : series.Candidates;

  const allCandidatesLackReleaseInfo = series.Candidates.every(candidate => !candidate.HasReleaseInfo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          buttonType="danger"
          className="flex items-center gap-x-2.5 px-4 py-3 font-semibold whitespace-nowrap"
          onClick={onPreviewSingle}
        >
          <Icon path={mdiTrashCanOutline} size={0.8333} />
          Preview Deletion for this Series
        </Button>
      </div>

      {allCandidatesLackReleaseInfo && (
        <div className="flex items-center gap-2 rounded-lg border border-panel-text-warning bg-panel-background-alt p-3 text-sm text-panel-text-warning">
          <Icon path={mdiAlertOutline} size={0.8333} />
          No release info available — rankings are estimates based on technical metadata only.
        </div>
      )}

      {!series.HasRedundantCandidates && !overrideKey && (
        <div className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel-background-alt p-3 text-sm">
          <Icon path={mdiAlertOutline} size={0.8333} className="shrink-0 text-panel-text-warning" />
          No candidates are fully redundant — manual review recommended. Use &ldquo;Select as primary&rdquo; to reorder
          candidates.
        </div>
      )}

      {candidatesWithRedundancy.map((candidate) => {
        const isPrimary = candidate.Key === effectivePrimary?.Key;
        const isOverrideActive = overrideKey === candidate.Key;
        const isPartial = isPartialCandidate(candidate);

        return (
          <CandidateCard
            key={candidate.Key}
            candidate={candidate}
            primaryEpisodes={effectivePrimary?.Episodes ?? []}
            isAiring={series.IsAiring}
            isPrimary={isPrimary}
            isOverrideActive={isOverrideActive}
            isPartial={isPartial}
            onSelectAsPrimary={() => onOverrideChange(series.SeriesID, candidate.Key)}
            onViewMixMatch={onViewMixMatch}
            onMarkAllAsVariations={onMarkAllAsVariations
              ? () => onMarkAllAsVariations(candidate.Files.map(file => file.VideoLocalID))
              : undefined}
          />
        );
      })}

      <div className="mt-2 flex justify-end">
        <Button
          buttonType="danger"
          className="flex items-center gap-x-2.5 px-4 py-3 font-semibold whitespace-nowrap"
          onClick={onPreviewSingle}
        >
          <Icon path={mdiTrashCanOutline} size={0.8333} />
          Preview Deletion for this Series
        </Button>
      </div>
    </div>
  );
};

export default CandidatesTab;
