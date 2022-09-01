import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { find, forEach, groupBy } from 'lodash';
import cx from 'classnames';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';

function SelectedFilesPanel() {
  const { selectedSeries, selectedRows, links } = useSelector((state: RootState) => state.utilities.unrecognized );

  const groupedLinks = useMemo(() => groupBy(links, 'EpisodeID'), [links]);

  const renderFileLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(groupedLinks, (episodeLinks) => {
      forEach(episodeLinks, (link, idx) => {
        const file = find(selectedRows, ['ID', link.FileID]);
        result.push(
          <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`}>
            {file?.Locations[0].RelativePath}
          </div>,
        );
      });
    });
    return result;
  };

  const manualLinkFileRows: Array<React.ReactNode> = [];
  forEach(selectedRows, (file) => {
    manualLinkFileRows.push(
      <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={file.ID}>
        {file.Locations[0].RelativePath}
      </div>,
    );
  });

  return (
    <ShokoPanel title="Selected Files" className="w-1/2">
      <div className="grow basis-0 overflow-y-auto">
        {selectedSeries?.ID ? renderFileLinks() : manualLinkFileRows}
      </div>
    </ShokoPanel>
  );
}

export default SelectedFilesPanel;
