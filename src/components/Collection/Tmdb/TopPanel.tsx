import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mdiLinkPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { countBy, filter, flatMap } from 'lodash';

import Button from '@/components/Input/Button';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import ItemCount from '@/components/Utilities/ItemCount';
import { MatchRatingType } from '@/core/types/api/episode';
import useNavigateVoid from '@/hooks/useNavigateVoid';

import type { TmdbEpisodeXrefType } from '@/core/types/api/tmdb';

type Props = {
  createInProgress: boolean;
  disableCreateLink: boolean;
  handleCreateLink: () => void;
  seriesId: number;
  xrefs?: Record<string, TmdbEpisodeXrefType[]>;
  xrefsCount?: number;
};

const TopPanel = (props: Props) => {
  const { t } = useTranslation('panels');
  const { createInProgress, disableCreateLink, handleCreateLink, seriesId, xrefs, xrefsCount } = props;
  const navigate = useNavigateVoid();

  const flatXrefs = useMemo(
    () => {
      if (!xrefs) return undefined;
      return filter(
        flatMap(xrefs, xref => xref),
        xref => xref.Rating !== MatchRatingType.None,
      );
    },
    [xrefs],
  );

  const matchRatingCounts = useMemo(
    () => (flatXrefs ? countBy(flatXrefs, 'Rating') : {}),
    [flatXrefs],
  ) as Record<MatchRatingType, number>;

  return (
    <ShokoPanel
      title={t('tmdbTopPanel.metadataLinking')}
      options={<ItemCount count={xrefsCount ?? flatXrefs?.length ?? 0} suffix={t('tmdbTopPanel.entries')} />}
      className="sticky -top-6 z-10"
    >
      <div className="flex items-center gap-x-3">
        <div
          className={cx(
            'flex grow items-center gap-x-4 rounded-lg border border-panel-border bg-panel-background-alt px-4 py-3',
            !flatXrefs && 'opacity-50 pointer-events-none',
          )}
        >
          {t('tmdbTopPanel.matchType')}
          <span>|</span>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-important px-2 text-button-primary-text">
              {(matchRatingCounts.DateAndTitleMatches ?? 0) + (matchRatingCounts.TitleMatches ?? 0)}
            </div>
            {t('tmdbTopPanel.perfect')}
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-warning px-2 text-button-primary-text">
              {(matchRatingCounts.DateAndTitleKindaMatches ?? 0) + (matchRatingCounts.DateMatches ?? 0)
                + (matchRatingCounts.TitleKindaMatches ?? 0)}
            </div>
            {t('tmdbTopPanel.approximate')}
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-danger px-2 text-button-primary-text">
              {matchRatingCounts.FirstAvailable ?? 0}
            </div>
            {t('tmdbTopPanel.fallback')}
          </div>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-panel-text-primary px-2 text-button-primary-text">
              {matchRatingCounts.UserVerified ?? 0}
            </div>
            {t('tmdbTopPanel.override')}
          </div>
        </div>
        <Button
          buttonType="secondary"
          buttonSize="normal"
          className="flex flex-row flex-wrap items-center gap-x-2 py-3"
          onClick={() => navigate(`/webui/collection/series/${seriesId}`)}
        >
          {t('tmdbTopPanel.cancel')}
        </Button>
        <Button
          buttonType="primary"
          buttonSize="normal"
          className="flex flex-row flex-wrap items-center gap-x-2 py-3"
          onClick={handleCreateLink}
          disabled={disableCreateLink}
          tooltip={disableCreateLink ? t('tmdbTopPanel.noLinksToSave') : ''}
          loading={createInProgress}
        >
          <Icon path={mdiLinkPlus} size={1} />
          {t('tmdbTopPanel.saveLinks')}
        </Button>
      </div>
    </ShokoPanel>
  );
};

export default TopPanel;
