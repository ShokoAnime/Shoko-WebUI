import { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { mdiAlertOutline, mdiArrowRightThin, mdiChevronDown, mdiFlagOutline, mdiStar, mdiSwapVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';
import { useToggle } from 'usehooks-ts';

import { Badge } from '@/components/Badge';
import Button from '@/components/Input/Button';
import CandidateCardFileList from '@/components/Utilities/ReleaseManagement/SeriesDetail/CandidateCardFileList';
import CandidateCardSignals from '@/components/Utilities/ReleaseManagement/SeriesDetail/CandidateCardSignals';
import { useMarkVariationMutation } from '@/core/react-query/file/mutations';
import { resetQueries } from '@/core/react-query/queryClient';
import toast from '@/core/toast';
import { buildEpisodeCoverageString, signalLabels } from '@/core/utilities/releaseManagementHelpers';

import type { EpisodeCoverageType, ReleaseCandidateType } from '@/core/types/api/release-management';

type Props = {
  candidate: ReleaseCandidateType;
  primaryEpisodes: EpisodeCoverageType[];
  isAiring: boolean;
  isPrimary: boolean;
  setPrimaryCandidate: () => void;
};

const CandidateCard = ({
  candidate,
  isAiring,
  isPrimary,
  primaryEpisodes,
  setPrimaryCandidate,
}: Props) => {
  const [filesExpanded, toggleFilesExpanded] = useToggle(false);
  const [markVariationsPending, setMarkVariationsPending] = useState(false);

  const coverageString = buildEpisodeCoverageString(candidate.Episodes);
  const realFiles = candidate.Files.filter(file => !file.IsVariation);
  const variationFiles = candidate.Files.filter(file => file.IsVariation);
  const totalSize = realFiles.reduce((sum, file) => sum + file.FileSize, 0);
  const redundantEpisodeStr = buildEpisodeCoverageString(candidate.RedundantEpisodes);
  const multiFileEpisodeCount = candidate.Episodes.filter(episode => episode.PlaceIDs.length > 1).length;

  const isVersion = candidate.DecidingSignal === 'Version';

  let strategyLabel = '';
  if (candidate.VersionStrategy === 'Consistent') strategyLabel = `v${candidate.Version} Consistent`;
  else if (candidate.VersionStrategy === 'BestAvailable') {
    strategyLabel = candidate.Version > 1
      ? `Best Available (up to v${candidate.Version})`
      : 'Best Available';
  }

  const { mutateAsync: markVariation } = useMarkVariationMutation();
  const handleMarkAllAsVariations = async () => {
    try {
      setMarkVariationsPending(true);
      await Promise.all(realFiles.map(file => markVariation({ fileId: file.VideoLocalID, variation: true })));
      resetQueries(['release-management']);
      toast.success(`Marked ${realFiles.length} file${realFiles.length !== 1 ? 's' : ''} as variations`);
    } catch (_error) {
      toast.error('Failed to mark files as variations');
    }
    setMarkVariationsPending(false);
  };

  return (
    <div
      className={cx(
        'flex cursor-pointer flex-col gap-y-3 rounded-lg border bg-panel-background p-4',
        isPrimary ? 'border-panel-text-primary' : 'border-panel-border',
      )}
      onClick={toggleFilesExpanded}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        {isPrimary && <Icon path={mdiStar} size={0.8333} className="text-panel-text-primary" />}

        <div className="font-semibold">
          Rank&nbsp;
          {candidate.Rank}
        </div>

        <div className="font-semibold text-panel-text-important">
          {candidate.Name}
        </div>

        {candidate.IsMixed && <Badge className="bg-panel-text-warning text-button-primary-text">MIXED</Badge>}

        {strategyLabel && <Badge className="bg-panel-text-primary text-button-primary-text">{strategyLabel}</Badge>}

        {isVersion && candidate.WinnerValue != null && candidate.LoserValue != null && (
          <Badge className="flex gap-x-1 bg-panel-input">
            v{candidate.LoserValue}
            <Icon path={mdiArrowRightThin} size={0.67} />
            v{candidate.WinnerValue}
          </Badge>
        )}

        {!candidate.HasReleaseInfo && (
          <Icon
            path={mdiAlertOutline}
            size={0.8333}
            className="shrink-0 text-panel-text-warning"
            data-tooltip-id="tooltip"
            data-tooltip-content="Quality signals are incomplete  -  some files are unrecognized"
          />
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            buttonType="secondary"
            buttonSize="small"
            className={cx('flex items-center gap-x-1', isPrimary && 'opacity-0!')}
            onClick={(event) => {
              event.stopPropagation();
              setPrimaryCandidate();
            }}
            disabled={isPrimary}
          >
            <Icon path={mdiSwapVertical} size={0.8333} />
            Select as Primary
          </Button>

          <Button
            buttonType="secondary"
            buttonSize="small"
            className="flex items-center gap-x-1"
            onClick={(event) => {
              event.stopPropagation();
              handleMarkAllAsVariations().catch(console.error);
            }}
            tooltip="Mark all files in this candidate as variations"
            loading={markVariationsPending}
          >
            <Icon path={mdiFlagOutline} size={0.8333} />
            Mark all as Variations
          </Button>

          <Icon
            path={mdiChevronDown}
            size={0.8333}
            rotate={filesExpanded ? -180 : 0}
            className="transition-transform"
          />
        </div>
      </div>

      {/* Deciding signal */}
      {!isPrimary && candidate.DecidingSignal && candidate.WinnerValue && candidate.LoserValue && (
        <div className="text-sm opacity-65">
          Ranked lower by:&nbsp;
          <span className="font-semibold">
            {signalLabels[candidate.DecidingSignal] ?? candidate.DecidingSignal}
          </span>
          {candidate.DecidingType && ' for '}
          {candidate.DecidingType && <span className="font-semibold">{candidate.DecidingType}s</span>}
          &nbsp;(
          {isVersion && 'v'}
          {candidate.LoserValue}
          &nbsp;
          {'<'}
          &nbsp;
          {isVersion && 'v'}
          {candidate.WinnerValue}
          )
        </div>
      )}

      <CandidateCardSignals candidate={candidate} />

      {/* Episode coverage + file summary */}
      <div className="border-t border-panel-border pt-3 text-sm">
        Coverage:&nbsp;
        <span className="font-semibold">{coverageString !== '' ? coverageString : 'None'}</span>
        {multiFileEpisodeCount > 0 && (
          <span
            className="ml-2 text-panel-text-warning"
            data-tooltip-id="tooltip"
            data-tooltip-content="Multiple files legitimately cover the same episode - a multi-part release, or files with no detectable difference"
          >
            (
            {multiFileEpisodeCount}
            &nbsp;
            {multiFileEpisodeCount === 1 ? 'episode has' : 'episodes have'}
            &nbsp;multiple files)
          </span>
        )}

        <div className="mt-1">
          Files:&nbsp;
          <span className="font-semibold">{realFiles.length}</span>
          {candidate.RedundantFileCount > 0 && (
            <>
              &nbsp;(
              <span className="text-panel-text-danger">
                {candidate.RedundantFileCount} to delete
                {redundantEpisodeStr && `, ${redundantEpisodeStr}`}
              </span>
              )
            </>
          )}
          {variationFiles.length > 0 && (
            <>
              &nbsp;(+
              {variationFiles.length}
              &nbsp;
              {variationFiles.length === 1 ? 'variation' : 'variations'})
            </>
          )}
          &nbsp;,&nbsp;
          <span className="font-semibold">{prettyBytes(totalSize, { binary: true })}</span>
        </div>
      </div>

      <AnimateHeight
        height={filesExpanded ? 'auto' : 0}
        className="-mt-4"
      >
        <CandidateCardFileList
          candidate={candidate}
          isAiring={isAiring}
          isPrimary={isPrimary}
          primaryEpisodes={primaryEpisodes}
        />
      </AnimateHeight>
    </div>
  );
};

export default CandidateCard;
