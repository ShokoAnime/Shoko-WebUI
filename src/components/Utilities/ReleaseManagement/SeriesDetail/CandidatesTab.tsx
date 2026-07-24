import { useEffect } from 'react';
import { mdiAlertOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import { typeOrder } from '@/core/utilities/releaseManagementHelpers';

import CandidateCard from './CandidateCard';

import type {
  EpisodeCoverageType,
  ReleaseCandidateType,
  SeriesWithCandidatesType,
} from '@/core/types/api/release-management';

type Props = {
  primaryCandidate?: ReleaseCandidateType;
  series: SeriesWithCandidatesType;
  setPrimaryCandidate: (candidate: ReleaseCandidateType) => void;
};

const isSubsetOf = (subset: EpisodeCoverageType[], superset: Set<string>): boolean =>
  subset.every(episode => superset.has(`${episode.Type}:${episode.Number}`));

const CandidatesTab = ({ primaryCandidate, series, setPrimaryCandidate }: Props) => {
  useEffect(() => {
    if (series.HasRedundantCandidates && series.Candidates.length > 0) {
      setPrimaryCandidate(series.Candidates[0]);
    }
  }, [series, setPrimaryCandidate]);

  const primaryEpisodeSet = new Set(primaryCandidate?.Episodes.map(episode => `${episode.Type}:${episode.Number}`));

  const primaryPlaceIds = new Set(primaryCandidate?.Files.map(fileEntry => fileEntry.PlaceID));

  const candidatesWithRedundancy = series.Candidates.map((candidate) => {
    if (candidate.Key === primaryCandidate?.Key) {
      return { ...candidate, IsRedundant: false, RedundantFileCount: 0, RedundantEpisodes: [] };
    }
    const candidateRedundant = isSubsetOf(candidate.Episodes, primaryEpisodeSet);

    const deletedFiles = candidate.Files.filter((fileEntry) => {
      if (primaryPlaceIds.has(fileEntry.PlaceID)) return false;
      if (candidateRedundant) return true;
      return series.IsAiring
        && fileEntry.Episodes.length > 0
        && fileEntry.Episodes.every(epEntry => primaryEpisodeSet.has(`${epEntry.Type}:${epEntry.Number}`));
    });

    const episodeMap = new Map<string, EpisodeCoverageType>();
    for (const file of deletedFiles) {
      for (const epEntry of file.Episodes) {
        const key = `${epEntry.Type}:${epEntry.Number}`;
        if (!episodeMap.has(key)) episodeMap.set(key, epEntry);
      }
    }

    const redundantEpisodes = [...episodeMap.values()].sort(
      (lhs, rhs) => (typeOrder[lhs.Type] ?? 99) - (typeOrder[rhs.Type] ?? 99) || lhs.Number - rhs.Number,
    );

    return {
      ...candidate,
      IsRedundant: candidateRedundant,
      RedundantFileCount: deletedFiles.length,
      RedundantEpisodes: redundantEpisodes,
    };
  });

  const allCandidatesLackReleaseInfo = series.Candidates.every(candidate => !candidate.HasReleaseInfo);

  return (
    <div className="flex grow flex-col gap-4">
      {allCandidatesLackReleaseInfo && (
        <div className="flex items-center gap-2 rounded-lg border border-panel-text-warning bg-panel-background-alt p-3 text-sm text-panel-text-warning">
          <Icon path={mdiAlertOutline} size={0.8333} />
          No release info available - rankings are estimates based on technical metadata only.
        </div>
      )}

      {!series.HasRedundantCandidates && !primaryCandidate?.Key && (
        <div className="flex items-center gap-2 rounded-lg border border-panel-text-warning bg-panel-background-alt p-3 text-sm">
          <Icon path={mdiAlertOutline} size={0.8333} className="shrink-0 text-panel-text-warning" />
          No candidates are fully redundant - manual review recommended. Use &ldquo;Select as primary&rdquo; to reorder
          candidates.
        </div>
      )}

      <div className="flex grow flex-col gap-y-2 overflow-y-auto pr-2 contain-strict">
        {candidatesWithRedundancy.map((candidate) => {
          const isPrimary = candidate.Key === primaryCandidate?.Key;

          return (
            <CandidateCard
              key={candidate.Key}
              candidate={candidate}
              primaryEpisodes={primaryCandidate?.Episodes ?? []}
              isAiring={series.IsAiring}
              isPrimary={isPrimary}
              setPrimaryCandidate={() => setPrimaryCandidate(candidate)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CandidatesTab;
