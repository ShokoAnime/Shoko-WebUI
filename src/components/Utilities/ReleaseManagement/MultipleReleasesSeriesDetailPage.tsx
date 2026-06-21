import React, { useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router';
import { mdiArrowLeft, mdiFlagOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { useImmer } from 'use-immer';

import Button from '@/components/Input/Button';
import toast from '@/core/toast';
import { useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import { useMultipleReleaseSeriesDetailQuery } from '@/core/react-query/release-management/queries';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import CandidatesTab from './CandidatesTab';
import ManageVariationsModal from './ManageVariationsModal';
import MixAndMatchTab from './MixAndMatchTab';
import MultipleReleasesPreviewModal from './MultipleReleasesPreviewModal';

import type { ReleaseDeletionPreviewType } from '@/core/types/api/release-management';

const MultipleReleasesSeriesDetailPage = () => {
  const { seriesId: seriesIdParam } = useParams<{ seriesId: string }>();
  const navigate = useNavigateVoid();
  const location = useLocation();
  const listSearch = (location.state as { listSearch?: string } | null)?.listSearch;
  const [searchParams, setSearchParams] = useSearchParams();

  const seriesId = Number(seriesIdParam ?? 0);
  const activeTab = searchParams.get('tab') ?? 'candidates';

  const [manageVariationsOpen, setManageVariationsOpen] = useState(false);

  const seriesQuery = useMultipleReleaseSeriesDetailQuery(seriesId, false, seriesId > 0);

  const [overrides, setOverrides] = useImmer<Map<number, string>>(new Map());

  const [previewOpen, setPreviewOpen] = useState(false);
  const [mixMatchPreviewData, setMixMatchPreviewData] = useState<ReleaseDeletionPreviewType[] | undefined>(undefined);

  const { mutateAsync: markVariation } = useMarkVariationMutation();

  const handleOverrideChange = (seriesID: number, candidateKey: string) => {
    setOverrides((draft) => {
      if (draft.get(seriesID) === candidateKey) {
        draft.delete(seriesID);
      } else {
        draft.set(seriesID, candidateKey);
      }
    });
  };

  const handlePreviewSingle = () => {
    setMixMatchPreviewData(undefined);
    setPreviewOpen(true);
  };

  const handleMixMatchPreviewReady = (data: ReleaseDeletionPreviewType) => {
    setMixMatchPreviewData([data]);
    setPreviewOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleClose = () => {
    setPreviewOpen(false);
    setMixMatchPreviewData(undefined);
  };

  const handleMarkAllAsVariations = async (videoLocalIds: number[]) => {
    try {
      await Promise.all(videoLocalIds.map(fileId => markVariation({ fileId, variation: true })));
      resetQueries(['release-management']);
      toast.success(`Marked ${videoLocalIds.length} file${videoLocalIds.length !== 1 ? 's' : ''} as variations`);
    } catch (_error) {
      toast.error('Failed to mark files as variations');
    }
  };

  if (seriesId <= 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-panel-text-danger">Invalid series ID.</span>
      </div>
    );
  }

  const series = seriesQuery.data;

  return (
    <>
      <title>
        {series ? `${series.SeriesTitle} | Release Management | Shoko` : 'Release Management | Shoko'}
      </title>
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
        {/* Back button + title */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            buttonType="secondary"
            buttonSize="small"
            className="flex items-center gap-x-1"
            onClick={() =>
              navigate(`/webui/utilities/release-management/MultipleReleases${listSearch ? `?${listSearch}` : ''}`)}
          >
            <Icon path={mdiArrowLeft} size={0.8333} />
            Back
          </Button>
          <h1 className="text-xl font-semibold">
            {series?.SeriesTitle ?? 'Loading…'}
          </h1>
          {series?.IsAiring && (
            <span className="rounded-sm bg-panel-text-primary/20 px-2 py-0.5 text-xs font-semibold text-panel-text-primary">
              AIRING
            </span>
          )}
          {series && (
            <a
              href={`https://anidb.net/anime/${series.AnidbAnimeID}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-panel-text-primary hover:underline"
            >
              {`AniDB #${series.AnidbAnimeID}`}
            </a>
          )}
          <div className="ml-auto">
            <Button
              buttonType="secondary"
              buttonSize="small"
              className="flex items-center gap-x-1"
              onClick={() => setManageVariationsOpen(true)}
              tooltip="Multi-select files to mark or unmark as variations"
            >
              <Icon path={mdiFlagOutline} size={0.8333} />
              Manage Variations
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-panel-border">
          <button
            type="button"
            disabled={activeTab === 'candidates'}
            className={cx(
              'px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === 'candidates'
                ? 'border-b-2 border-panel-text-primary text-panel-text-primary'
                : 'opacity-65 hover:opacity-100',
            )}
            onClick={() => handleTabChange('candidates')}
          >
            Candidates
          </button>
          <button
            type="button"
            disabled={activeTab === 'mixmatch'}
            className={cx(
              'px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === 'mixmatch'
                ? 'border-b-2 border-panel-text-primary text-panel-text-primary'
                : 'opacity-65 hover:opacity-100',
            )}
            onClick={() => handleTabChange('mixmatch')}
          >
            Mix &amp; Match
          </button>
        </div>

        {/* Content */}
        {seriesQuery.isPending && (
          <div className="flex h-32 items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={2} spin />
          </div>
        )}

        {seriesQuery.isError && (
          <div className="flex h-32 items-center justify-center">
            <span className="text-panel-text-danger">
              Failed to load series candidates. The series may have no multiple releases.
            </span>
          </div>
        )}

        {series && activeTab === 'candidates' && (
          <CandidatesTab
            series={series}
            overrides={overrides}
            onOverrideChange={handleOverrideChange}
            onPreviewSingle={handlePreviewSingle}
            onViewMixMatch={() => handleTabChange('mixmatch')}
            onMarkAllAsVariations={(ids) => {
              handleMarkAllAsVariations(ids).catch(console.error);
            }}
          />
        )}

        {series && activeTab === 'mixmatch' && (
          <MixAndMatchTab
            series={series}
            onPreviewReady={handleMixMatchPreviewReady}
          />
        )}
      </div>

      {series && (
        <MultipleReleasesPreviewModal
          open={previewOpen}
          includedSeriesIDs={[seriesId]}
          overrides={overrides}
          precomputedData={mixMatchPreviewData}
          onClose={handleClose}
          onSuccess={() =>
            navigate(`/webui/utilities/release-management/MultipleReleases${listSearch ? `?${listSearch}` : ''}`)}
        />
      )}

      <ManageVariationsModal
        open={manageVariationsOpen}
        seriesId={seriesId}
        seriesTitle={series?.SeriesTitle}
        onClose={() => setManageVariationsOpen(false)}
      />
    </>
  );
};

export default MultipleReleasesSeriesDetailPage;
