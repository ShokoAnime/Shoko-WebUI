import React from 'react';
import { useSelector } from 'react-redux';
import { forEach } from 'lodash';
import cx from 'classnames';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import { RootState } from '../../../../core/store';

function SelectedFilesPanel() {
  const { selectedSeries, selectedRows } = useSelector((state: RootState) => state.utilities.unrecognized );

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
        {manualLinkFileRows}
      </div>
    </ShokoPanel>
  );
}

export default SelectedFilesPanel;
