import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { debounce, forEach } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiOpenInNew, mdiMagnify } from '@mdi/js';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';
import Input from '../../../../components/Input/Input';

import { setSelectedSeries, setLinks } from '../../../../core/slices/utilities/unrecognized';
import { useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/seriesApi';

import type { SeriesAniDBSearchResult } from '../../../../core/types/api/series';



function SeriesLinkPanel() {
  const [searchText, setSearchText] = useState('');

  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();
  const dispatch = useDispatch();
  const updateSelectedSeries = (series: SeriesAniDBSearchResult) => {
    dispatch(setSelectedSeries(series));
    dispatch(setLinks([]));
  };

  const debouncedSearch = useRef(
    debounce( (query: string) => {
      searchTrigger({ query, pageSize: 20 }).catch(() => {});
    }, 200),
  ).current;

  const handleSearch = (query: string) => {
    setSearchText(query);
    if (query !== '')
      debouncedSearch(query);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const renderRow = (data: SeriesAniDBSearchResult) => (
    <tr key={data.ID} onClick={() => updateSelectedSeries(data)} className="cursor-pointer">
      <td className="pt-1.5">
        <div className="flex justify-between mr-6">
          {data.ID}
          <span onClick={(e) => {
            e.stopPropagation();
            window.open(`https://anidb.net/anime/${data.ID}`, '_blank');
          }}>
            <Icon path={mdiOpenInNew} size={1} className="text-highlight-1 cursor-pointer" />
          </span>
        </div>
      </td>
      <td className="pt-1.5">{data.Title}</td>
      <td className="pt-1.5">{data.EpisodeCount ?? '-'}</td>
      <td className="pt-1.5">{data.Type}</td>
    </tr>
  );

  const rows: Array<React.ReactNode> = [];
  forEach(searchResults.data, (result) => {
    rows.push(renderRow(result));
  });

  return (
    <ShokoPanel title="Series Link" className="w-1/2">
      <div className="flex px-0.5">
        <Input
          id="link-search"
          type="text"
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Enter Series Name or AniDB ID..."
          className="grow"
          startIcon={mdiMagnify}
        />
      </div>
      <div className="flex mt-4 bg-background-alt border border-background-border rounded-md px-4 pb-4 overflow-y-auto grow basis-0 items-start">
        <table className="table-fixed text-left w-full">
          <thead className="sticky top-0 bg-background-alt">
          <tr className="box-border font-semibold">
            <td className="w-28 py-3">AniDB ID</td>
            <td className="w-auto py-3">Series Name</td>
            <td className="w-16 py-3">EPs</td>
            <td className="w-24 py-3">Type</td>
          </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>
      </div>
    </ShokoPanel>
  );
}

export default SeriesLinkPanel;
