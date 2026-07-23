import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { mdiChevronRight, mdiFlagOutline, mdiLoading, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';
import { useImmer } from 'use-immer';
import { useToggle } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ShokoIcon from '@/components/ShokoIcon';
import MultipleReleasesPreviewModal from '@/components/Utilities/ReleaseManagement/MultipleReleasesPreviewModal';
import { useMultipleReleaseSeriesDetailQuery } from '@/core/react-query/release-management/queries';
import toast from '@/core/toast';
import { getAnidbAnimeLink } from '@/core/util';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import CandidatesTab from './SeriesDetail/CandidatesTab';
import ManageVariationsModal from './SeriesDetail/ManageVariationsModal';
import MixAndMatchTab from './SeriesDetail/MixAndMatchTab';

import type { ReleaseCandidateType } from '@/core/types/api/release-management';

const Title = (
  { anidbId, isAiring, seriesId, seriesTitle }: {
    anidbId: number;
    isAiring: boolean;
    seriesId: number;
    seriesTitle: string;
  },
) => {
  const navigate = useNavigateVoid();

  return (
    <div className="flex min-w-0 grow items-center gap-x-2">
      <div onClick={() => navigate(-1)} className="shrink-0 cursor-pointer text-panel-text-primary">
        Release Management
      </div>
      <Icon path={mdiChevronRight} size={1} />
      <div
        className="truncate"
        data-tooltip-id="tooltip"
        data-tooltip-content={seriesTitle}
      >
        {seriesTitle}
      </div>

      <div className="ml-auto flex items-center gap-x-4 text-sm">
        <a
          href={getAnidbAnimeLink(anidbId)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-x-1 font-semibold text-panel-text-primary"
        >
          <div className="metadata-link-icon AniDB" />
          {anidbId}
          <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={0.833} />
        </a>

        <Link
          to={`/webui/collection/series/${seriesId}`}
          className="flex items-center gap-x-1 font-semibold text-panel-text-primary"
        >
          <ShokoIcon className="size-6" />
          {seriesId}
          <Icon className="text-panel-icon-action" path={mdiOpenInNew} size={0.833} />
        </Link>

        {isAiring && (
          <Badge className="bg-panel-text-warning text-button-primary-text">
            Airing
          </Badge>
        )}
      </div>
    </div>
  );
};

const ReleaseManagementSeriesDetail = () => {
  const navigate = useNavigateVoid();
  const { seriesId: seriesIdParam } = useParams<{ seriesId: string }>();
  const [searchParams] = useSearchParams();

  const seriesId = toNumber(seriesIdParam ?? 0);
  const activeTab = searchParams.get('tab') ?? 'candidates';
  const includeVariations = (searchParams.get('includeVariations') ?? 'true') === 'true';

  const [showManageVariationsModal, toggleManageVariationsModal] = useToggle(false);
  const [showPreviewModal, togglePreviewModal] = useToggle(false);

  const [primaryCandidate, setPrimaryCandidate] = useState<ReleaseCandidateType | undefined>();
  const [mixMatchSelection, setMixMatchSelection] = useImmer<Map<string, number>>(new Map());
  const [mixMatchUnassignedCount, setMixMatchUnassignedCount] = useState(0);

  const seriesQuery = useMultipleReleaseSeriesDetailQuery(seriesId, includeVariations, seriesId > 0);
  const series = seriesQuery.data;

  useEffect(() => {
    if (seriesQuery.isError) {
      toast.error(`Series ${seriesId} is invalid or does not have multiple releases`);
      navigate('/webui/utilities/release-management');
    }
  }, [navigate, seriesId, seriesQuery.isError]);

  if (seriesQuery.isPending || !series) {
    return (
      <>
        <title>
          Release Management | Shoko
        </title>
        <div className="flex grow items-center justify-center">
          <Icon path={mdiLoading} size={4} spin className="text-panel-text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <title>
        {`${series.SeriesTitle} | Release Management | Shoko`}
      </title>
      <ShokoPanel
        title={
          <Title
            seriesTitle={series.SeriesTitle}
            seriesId={series.SeriesID}
            anidbId={series.AnidbAnimeID}
            isAiring={series.IsAiring}
          />
        }
      >
        <div className="flex items-center gap-x-3">
          <div className="flex grow items-center gap-x-4 rounded-md border border-panel-border bg-panel-background-alt px-4 py-2">
            <Checkbox
              id="includeVariations"
              isChecked={includeVariations}
              onChange={() => ({})}
              label="Include Variations"
              labelRight
              disabled
            />
          </div>

          <Button
            buttonType="secondary"
            className="flex items-center gap-x-1 px-4 py-3"
            onClick={toggleManageVariationsModal}
            tooltip="Multi-select files to mark or unmark as variations"
          >
            <Icon path={mdiFlagOutline} size={0.8333} />
            Manage Variations
          </Button>

          <Button
            buttonType="danger"
            className="flex items-center gap-x-2.5 px-4 py-3 font-semibold whitespace-nowrap"
            onClick={togglePreviewModal}
            disabled={activeTab === 'candidates' ? !primaryCandidate : mixMatchUnassignedCount > 0}
          >
            <Icon path={mdiTrashCanOutline} size={0.8333} />
            Delete
          </Button>
        </div>
      </ShokoPanel>
      <div className="flex grow flex-col gap-4 overflow-y-auto px-2">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-panel-border">
          <Link
            className={cx(
              'px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === 'candidates'
                ? 'border-b-2 border-panel-text-primary text-panel-text-primary'
                : 'opacity-65 hover:opacity-100',
            )}
            to="?tab=candidates"
            replace
          >
            Candidates
          </Link>
          <Link
            type="button"
            className={cx(
              'px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === 'mixmatch'
                ? 'border-b-2 border-panel-text-primary text-panel-text-primary'
                : 'opacity-65 hover:opacity-100',
            )}
            to="?tab=mixmatch"
            replace
          >
            Mix &amp; Match
          </Link>
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
            primaryCandidate={primaryCandidate}
            series={series}
            setPrimaryCandidate={setPrimaryCandidate}
          />
        )}

        {series && activeTab === 'mixmatch' && (
          <MixAndMatchTab
            selection={mixMatchSelection}
            series={series}
            setSelection={setMixMatchSelection}
            setUnassignedCount={setMixMatchUnassignedCount}
          />
        )}
      </div>

      <ManageVariationsModal
        show={showManageVariationsModal}
        seriesId={seriesId}
        seriesTitle={series?.SeriesTitle}
        onClose={toggleManageVariationsModal}
      />

      <MultipleReleasesPreviewModal
        selectedSeries={[seriesId]}
        show={showPreviewModal}
        onClose={togglePreviewModal}
        primaryCandidateKey={activeTab === 'candidates' ? primaryCandidate?.Key : undefined}
        mixMatchSelection={mixMatchSelection.size > 0 ? [...mixMatchSelection.values()] : undefined}
      />
    </>
  );
};

export default ReleaseManagementSeriesDetail;
