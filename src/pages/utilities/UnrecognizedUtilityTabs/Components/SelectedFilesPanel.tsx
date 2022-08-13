import React from 'react';
import { forEach } from 'lodash';
import cx from 'classnames';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import type { FileType } from '../../../../core/types/api/file';
import type { SeriesAniDBSearchResult } from '../../../../core/types/api/series';

type Props = {
  files: Array<FileType>;
  selectedSeries: SeriesAniDBSearchResult;
};

function SelectedFilesPanel(props: Props) {
  const { files, selectedSeries } = props;

  const manualLinkFileRows: Array<React.ReactNode> = [];
  forEach(files, (file) => {
    manualLinkFileRows.push(
      <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={file.ID}>
        {file.Locations[0].RelativePath}
      </div>,
    );
  });

  return (
    <ShokoPanel title="Selected Files" className="w-1/2">
      {manualLinkFileRows}
    </ShokoPanel>
  );
}

export default SelectedFilesPanel;
