import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { find, forEach, orderBy } from 'lodash';
import cx from 'classnames';
import { ScrollSyncPane } from 'react-scroll-sync';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';
import { ManualLink } from '../../../../core/slices/utilities/unrecognized';

function SelectedFilesPanel() {
  const { selectedSeries, selectedRows, links } = useSelector((state: RootState) => state.utilities.unrecognized );
  const fileLinks = useMemo(() => orderBy<ManualLink>(links, (item) => { 
    const file = find(selectedRows, ['ID', item.FileID]);
    return file?.Locations?.[0].RelativePath ?? item.FileID;
  }), [links]);

  const renderFileLinks = () => {
    const result: React.ReactNode[] = [];
    forEach(fileLinks, (link, idx) => {
      const file = find(selectedRows, ['ID', link.FileID]);
      const path = file?.Locations?.[0].RelativePath ?? '';
      const isSameFile = idx > 0 && fileLinks[idx - 1].FileID === link.FileID;
      result.push(
        <div title={path} className={cx(['px-2 py-1.5 w-full bg-background-nav border border-background-border rounded-md line-clamp-1 leading-loose', selectedSeries?.ID && 'mb-3', isSameFile && 'opacity-25'])} key={`${link.FileID}-${link.EpisodeID}-${idx}`}>
          {path}
        </div>,
      );
    });
    
    return result;
  };

  const renderManualLinkFileRows = () => {
    const manualLinkFileRows: Array<React.ReactNode> = [];
    forEach(selectedRows, (file) => {
      manualLinkFileRows.push(
        <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={file.ID}>
          {file.Locations?.[0].RelativePath ?? ''}
        </div>,
      );
    });
    return manualLinkFileRows;
  };
  
  return (
    <ShokoPanel title="Selected Files" className="w-1/2">
      <ScrollSyncPane>
        <div className={cx(['grow basis-0 overflow-y-auto shoko-scrollbar'], selectedSeries?.ID && 'mt-14')}>
          {selectedSeries?.ID ? renderFileLinks() : renderManualLinkFileRows()}
        </div>
      </ScrollSyncPane>
    </ShokoPanel>
  );
}

export default SelectedFilesPanel;
