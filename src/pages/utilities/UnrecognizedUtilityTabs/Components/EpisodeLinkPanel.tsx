import React, { useState } from 'react';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';

import type { SeriesAniDBSearchResult } from '../../../../core/types/api/series';
import { FileType } from '../../../../core/types/api/file';
import cx from 'classnames';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Input/Button';
import ComboBox from '../../../../components/Input/ComboBox';

type Props = {
  files: Array<FileType>;
  selectedSeries: SeriesAniDBSearchResult;
  setSeries: (series: SeriesAniDBSearchResult) => void;
};

function EpisodeLinkPanel(props: Props) {
  const { selectedSeries, files } = props;
  
  const [ epType, setEpType ] = useState('1');
  const episodeOptions = [
    { value: '0', label: 'Special' },
    { value: '1', label: 'Episode' },
  ];
  
  const renderTitle = () => (
    <div className="flex gap-x-1 items-center">
      <span>AniDB</span>|
      <span className="text-highlight-2">{selectedSeries.ID} - {selectedSeries.Title}</span>
    </div>
  );

  return (
    <ShokoPanel title={renderTitle()} className="w-1/2">
      <div className="flex flex-row space-x-3 justify-end">
        <ComboBox className="w-72" options={episodeOptions} value={epType} onChange={value => setEpType(`${value}`)} />
        <Input inline label="Range Start" type="text" id="range" value="" onChange={() => {}} className="w-40"/>
        <Button className="bg-background-alt py-2 px-2 mr-2" onClick={() => {}}>Range Fill</Button>
      </div>
      {files.map(file => (
        <div className={cx(['px-3 py-3.5 w-full bg-background-nav border border-background-border rounded-md', selectedSeries?.ID && 'mt-4'])} key={file.ID}>
        Episodes
        </div>
      ))}
    </ShokoPanel>
  );
}

export default EpisodeLinkPanel;
