import React, { useCallback, useMemo } from 'react';
import { mdiAlertOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useMultipleReleaseSeriesDetailQuery } from '@/core/react-query/release-management/queries';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import CandidateCard from './CandidateCard';

import type { EpisodeCoverageType, ReleaseCandidateType } from '@/core/types/api/release-management';

type Props = {
  seriesId: number;
  overrides: Map<number, string>;
  onOverrideChange: (seriesId: number, candidateKey: string) => void;
  onPreviewSingle: () => void;
  onClose: () => void;
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

const buildEpisodeSet = (episodes: EpisodeCoverageType[]): Set<string> =>
  new Set(episodes.map(episode => `${episode.Type}:${episode.Number}`));

const isSubsetOf = (subset: EpisodeCoverageType[], superset: Set<string>): boolean =>
  subset.every(episode => superset.has(`${episode.Type}:${episode.Number}`));

const MultipleReleasesDetailModal = ({
  onClose,
  onOverrideChange,
  onPreviewSingle,
  overrides,
  seriesId,
}: Props) => {
  const show = seriesId > 0;

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');

  const detailQuery = useMultipleReleaseSeriesDetailQuery(seriesId, false, show);
  const series = detailQuery.data;

  // Per-file check state:
  // For redundant candidates: tracks which PlaceIDs are unchecked (user keeps them)
  // For non-redundant partial candidates (Scenario C): tracks which PlaceIDs are checked (user deletes them)
  const [perFileChecks, setPerFileChecks] = useImmer<Set<number>>(new Set());

  const overrideKey = series ? overrides.get(series.SeriesID) : undefined;

  const effectivePrimary = useMemo(() => {
    if (!series) return null;
    return computeEffectivePrimary(series.Candidates, overrideKey);
  }, [series, overrideKey]);

  const primaryEpisodeSet = useMemo(() => {
    if (!effectivePrimary) return new Set<string>();
    return buildEpisodeSet(effectivePrimary.Episodes);
  }, [effectivePrimary]);

  // Recompute redundancy locally when an override is active
  const candidatesWithRedundancy = useMemo(() => {
    if (!series) return [];
    if (!overrideKey || !effectivePrimary) return series.Candidates;

    return series.Candidates.map((candidate) => {
      if (candidate.Key === effectivePrimary.Key) return { ...candidate, IsRedundant: false };
      const redundant = isSubsetOf(candidate.Episodes, primaryEpisodeSet);
      return { ...candidate, IsRedundant: redundant };
    });
  }, [series, overrideKey, effectivePrimary, primaryEpisodeSet]);

  const handleFileCheckToggle = useCallback((placeId: number) => {
    setPerFileChecks((draft) => {
      if (draft.has(placeId)) draft.delete(placeId);
      else draft.add(placeId);
    });
  }, [setPerFileChecks]);

  const handleSelectAsPrimary = (candidateKey: string) => {
    if (!series) return;
    onOverrideChange(series.SeriesID, candidateKey);
    setPerFileChecks(new Set());
  };

  const allCandidatesLackReleaseInfo = series?.Candidates.every(candidate => !candidate.HasReleaseInfo) ?? false;

  return (
    <ModalPanel
      show={show}
      size="xl"
      onRequestClose={onClose}
      header={series ? series.SeriesTitle : 'Loading…'}
      subHeader={series && (
        <div className="flex items-center gap-2 text-sm opacity-65">
          {series.IsAiring && (
            <span className="rounded-sm bg-panel-text-primary px-1.5 py-0.5 text-xs font-semibold text-white">
              Airing
            </span>
          )}
          <span>
            {series.Candidates.length}
            {' '}
            candidates
          </span>
          {series.AnidbAnimeID > 0 && (
            <span>
              · AniDB&nbsp;
              {series.AnidbAnimeID}
            </span>
          )}
        </div>
      )}
      footer={(
        <div className="flex items-center justify-between">
          <Button buttonType="primary" onClick={onPreviewSingle} disabled={!series}>
            Preview for this series
          </Button>
          <Button buttonType="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
      fullHeight
    >
      <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
        {detailQuery.isPending && (
          <div className="flex h-full items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {detailQuery.isError && (
          <div className="flex h-full items-center justify-center">
            <span className="text-panel-text-danger">
              Failed to load series detail. The series may no longer have multiple candidates.
            </span>
          </div>
        )}

        {detailQuery.isSuccess && series && (
          <>
            {allCandidatesLackReleaseInfo && (
              <div className="flex items-center gap-2 rounded-sm border border-panel-text-warning bg-panel-background-alt p-3 text-sm text-panel-text-warning">
                <Icon path={mdiAlertOutline} size={0.8333} />
                No release info available — rankings are estimates based on technical metadata only.
              </div>
            )}

            {!series.HasRedundantCandidates && !overrideKey && (
              <div className="flex items-center gap-2 rounded-sm border border-panel-border bg-panel-background-alt p-3 text-sm">
                <Icon path={mdiAlertOutline} size={0.8333} className="shrink-0 text-panel-text-warning" />
                No candidates are fully redundant — manual review recommended. Use &ldquo;Select as primary&rdquo; to reorder candidates.
              </div>
            )}

            {candidatesWithRedundancy.map((candidate) => {
              const isPrimary = candidate.Key === effectivePrimary?.Key;
              const isOverrideActive = overrideKey === candidate.Key;

              return (
                <CandidateCard
                  key={candidate.Key}
                  candidate={candidate}
                  primaryEpisodes={effectivePrimary?.Episodes ?? []}
                  isAiring={series.IsAiring}
                  isPrimary={isPrimary}
                  isOverrideActive={isOverrideActive}
                  onSelectAsPrimary={() => handleSelectAsPrimary(candidate.Key)}
                  perFileChecks={perFileChecks}
                  onFileCheckToggle={handleFileCheckToggle}
                />
              );
            })}
          </>
        )}
      </div>
    </ModalPanel>
  );
};

export default MultipleReleasesDetailModal;
