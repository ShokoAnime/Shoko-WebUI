import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { forEach } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';

import { RootState } from '../../../core/store';
import Events from '../../../core/events';
import FixedPanel from '../../../components/Panels/FixedPanel';
import Select from '../../../components/Input/Select';
import Button from '../../../components/Input/Button';
import { SeriesInfoType } from '../../../core/types/api';

function SeriesInImportFolders() {
  const dispatch = useDispatch();

  const importFolders = useSelector((state: RootState) => state.mainpage.importFolders);
  const isFetching = useSelector((state: RootState) => state.fetching.importFolderSeries);
  const seriesInFolder = useSelector((state: RootState) => state.mainpage.importFolderSeries);

  const getSeries = (id: number) => dispatch(
    { type: Events.MAINPAGE_IMPORT_FOLDER_SERIES, payload: id },
  );

  const [selectedFolder, setSelectedFolder] = useState(1);

  useEffect(() => {
    setSelectedFolder(importFolders[0]?.ID);
    getSeries(selectedFolder);
  }, []);

  const renderItem = (series: SeriesInfoType, idx: number) => {
    let paths = '';

    forEach(series.paths, (path, index) => {
      if (index) paths += `, ${path}`;
      else paths = path;
    });

    return (
      <tr key={idx}>
        <td className="p-2">{`${idx}.`}</td>
        <td className="w-4/12 p-2">{series.name}</td>
        <td className="w-4/12 p-2">{paths}</td>
        <td className="p-2">{series.type}</td>
        <td className="p-2">{series.size} Files</td>
        <td className="p-2">{prettyBytes(series.filesize, { binary: true })}</td>
      </tr>
    );
  };

  const renderOptions = () => (
    <div className="flex font-mulish font-bold">
      <Select id="selectedFolder" value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)} className="mr-2">
        {importFolders.map(
          folder => (<option value={folder.ID}>{folder.Path}</option>),
        )}
      </Select>
      <Button onClick={() => getSeries(selectedFolder)} className="color-highlight-1">
        <FontAwesomeIcon icon={faRedoAlt} />
      </Button>
    </div>
  );

  return (
    <FixedPanel title="Series In Import Folder" options={renderOptions()} isFetching={isFetching}>
      <table className="table-auto">
        <tbody>
          {seriesInFolder.map((series, index) => renderItem(series, index + 1))}
        </tbody>
      </table>
    </FixedPanel>
  );
}

export default SeriesInImportFolders;
