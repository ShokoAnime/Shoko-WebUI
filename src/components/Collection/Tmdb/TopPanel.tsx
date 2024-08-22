import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mdiLinkPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { countBy } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';

import type { MatchRatingType } from '@/core/types/api/episode';
import type { TmdbXrefType } from '@/core/types/api/tmdb';

const TopPanel = (props: { seriesId: string, xrefs: TmdbXrefType[], xrefsCount: number }) => {
  const { seriesId, xrefs, xrefsCount } = props;
  const navigate = useNavigate();

  const matchRatingCounts = useMemo(
    () => countBy(xrefs, 'Rating'),
    [xrefs],
  ) as Record<MatchRatingType, number>;

  return (
    <ShokoPanel title="Metadata Linking" options={<ItemCount count={xrefsCount} suffix="Entries" />}>
      <div className="flex items-center gap-x-3">
        <div className="flex grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3">
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-important px-2 text-button-primary-text">
              {matchRatingCounts.DateAndTitleMatches ?? 0}
            </div>
            Dates and Title Match (DT)
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-warning px-2 text-button-primary-text">
              {(matchRatingCounts.DateMatches ?? 0) + (matchRatingCounts.TitleMatches ?? 0)}
            </div>
            Dates or Title Match (D/T)
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-primary px-2 text-button-primary-text">
              {matchRatingCounts.UserVerified ?? 0}
            </div>
            User Overridden (UO)
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-danger px-2 text-button-primary-text">
              {matchRatingCounts.FirstAvailable ?? 0}
            </div>
            Best Guess (BG)
          </div>
        </div>
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
          onClick={() => {}}
        >
          <Icon path={mdiLinkPlus} size={1} />
          Create Links
        </Button>
      </div>
    </ShokoPanel>
  );
};

export default TopPanel;
