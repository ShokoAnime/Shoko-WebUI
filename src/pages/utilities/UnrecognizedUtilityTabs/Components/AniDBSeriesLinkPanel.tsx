import React, { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { Icon } from '@mdi/react';
import { mdiLoading, mdiMagnify, mdiOpenInNew } from '@mdi/js';

import ShokoPanel from '../../../../components/Panels/ShokoPanel';
import Input from '../../../../components/Input/Input';

import { useLazyGetSeriesAniDBSearchQuery } from '../../../../core/rtkQuery/splitV3Api/seriesApi';

type Props = {
  initialQuery: string;
};

function AniDBSeriesLinkPanel({ initialQuery }: Props) {
  const [searchText, setSearchText] = useState('');

  const [searchTrigger, searchResults] = useLazyGetSeriesAniDBSearchQuery();

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

  useEffect(() => {
    if (searchText === '' && initialQuery !== '') debouncedSearch(initialQuery);
  }, [searchText, initialQuery]);

  return (
    <ShokoPanel title="AniDB Series Link" className="w-1/4">
      <div className="flex flex-col grow bg-background-alt border border-background-border rounded-md px-3 py-5">
        <Input id="search" value={searchText} type="text" placeholder="Search..." onChange={e => handleSearch(e.target.value)} startIcon={mdiMagnify} className="w-full" />
        <div className="flex flex-col basis-0 grow overflow-y-auto mt-2 text-sm">
          {searchResults.isLoading ?
            (<div className="flex grow justify-center items-center">
              <Icon path={mdiLoading} size={3} spin className="text-highlight-1" />
            </div>) :
            (searchResults.data ?? []).map(result => (
              <div key={result.ID} className="flex justify-between mt-1 items-center">
                {result.Title}
                <a href={`https://anidb.net/anime/${result.ID}/release/add`} target="_blank" rel="noopener noreferrer">
                  <Icon path={mdiOpenInNew} size={1} className="text-highlight-1 mr-2" />
                </a>
              </div>
            ))
          }
        </div>
      </div>
    </ShokoPanel>
  );
}

export default AniDBSeriesLinkPanel;
