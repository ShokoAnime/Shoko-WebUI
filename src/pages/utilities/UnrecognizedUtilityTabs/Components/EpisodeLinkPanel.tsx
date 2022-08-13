import React from 'react';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import type { SeriesAniDBSearchResult } from '../../../../core/types/api/series';

type Props = {
  selectedSeries: SeriesAniDBSearchResult;
  setSeries: (series: SeriesAniDBSearchResult) => void;
};

function EpisodeLinkPanel(props: Props) {
  const { selectedSeries } = props;

  const renderTitle = () => (
    <div className="flex gap-x-1 items-center">
      <span>AniDB</span>|
      <span className="text-highlight-2">{selectedSeries.ID} - {selectedSeries.Title}</span>
    </div>
  );

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      {selectedSeries.ID}
    </ShokoPanel>
  );
}

export default EpisodeLinkPanel;
