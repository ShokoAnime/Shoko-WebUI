import { useMemo } from 'react';
import { mdiLinkPlus, mdiRestore } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { countBy, filter, flatMap } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { MatchRatingValues } from '@/core/types/api/episode';

type RatedXrefType = {
  Rating: MatchRatingValues;
};

type Props = {
  createInProgress: boolean;
  disableCreateLink: boolean;
  handleCreateLink: () => void;
  handleResetLinks?: () => void;
  seriesId: number;
  xrefs?: Record<string, RatedXrefType[]>;
  xrefsCount?: number;
};

const TopPanel = (props: Props) => {
  const { createInProgress, disableCreateLink, handleCreateLink, handleResetLinks, seriesId, xrefs, xrefsCount } =
    props;
  const navigate = useNavigateVoid();

  const flatXrefs = useMemo(
    () => {
      if (!xrefs) return undefined;
      return filter(
        flatMap(xrefs, xref => xref),
        xref => xref.Rating !== 'None',
      );
    },
    [xrefs],
  );

  const matchRatingCounts = useMemo(
    () => (flatXrefs ? countBy(flatXrefs, 'Rating') : {}),
    [flatXrefs],
  ) as Record<MatchRatingValues, number>;

  return (
    <ShokoPanel
      title="Metadata Linking"
      options={<ItemCount count={xrefsCount ?? flatXrefs?.length ?? 0} suffix="Entries" />}
      className="sticky -top-6 z-10"
    >
      <div className="flex items-center gap-x-3">
        <div
          className={cx(
            'flex grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3',
            !flatXrefs && 'pointer-events-none opacity-50',
          )}
        >
          Match Type
          <span>|</span>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-important px-2 text-button-primary-text">
              {(matchRatingCounts.DateAndTitleMatches ?? 0) + (matchRatingCounts.TitleMatches ?? 0)
                + (matchRatingCounts.DateAndNumberMatches ?? 0)}
            </div>
            Perfect
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-warning px-2 text-button-primary-text">
              {(matchRatingCounts.DateAndTitleKindaMatches ?? 0) + (matchRatingCounts.DateMatches ?? 0)
                + (matchRatingCounts.TitleKindaMatches ?? 0) + (matchRatingCounts.DateKindaMatches ?? 0)
                + (matchRatingCounts.DateOffsetMatches ?? 0)}
            </div>
            Approximate
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-danger px-2 text-button-primary-text">
              {matchRatingCounts.FirstAvailable ?? 0}
            </div>
            Fallback
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-primary px-2 text-button-primary-text">
              {matchRatingCounts.UserVerified ?? 0}
            </div>
            Override
          </div>
        </div>
        {handleResetLinks && (
          <Button
            buttonType="secondary"
            buttonSize="normal"
            className="flex flex-row flex-wrap items-center gap-x-2 py-3"
            onClick={handleResetLinks}
            disabled={createInProgress}
            tooltip="Remove all existing episode links and re-run the automatic matching"
          >
            <Icon path={mdiRestore} size={1} />
            Reset Links
          </Button>
        )}
        <Button
          buttonType="secondary"
          buttonSize="normal"
          className="flex flex-row flex-wrap items-center gap-x-2 py-3"
          onClick={() => navigate(`/webui/collection/series/${seriesId}`)}
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          buttonSize="normal"
          className="flex flex-row flex-wrap items-center gap-x-2 py-3"
          onClick={handleCreateLink}
          disabled={disableCreateLink}
          tooltip={disableCreateLink ? 'No links to save!' : ''}
          loading={createInProgress}
        >
          <Icon path={mdiLinkPlus} size={1} />
          Save Links
        </Button>
      </div>
    </ShokoPanel>
  );
};

export default TopPanel;
