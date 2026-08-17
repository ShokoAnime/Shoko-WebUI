import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import type { FileSortOrderValue } from '@/core/types/api/file';

const useTableSearchSortCriteria = (defaultSortCriteria: FileSortOrderValue) => {
  const [sortCriteria, setSortCriteria] = useState<FileSortOrderValue>(defaultSortCriteria);
  const [searchSortCriteria, setSearchSortCriteria] = useState<FileSortOrderValue>();

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 250);

  const updateSortCriteria = (newCriteria: FileSortOrderValue) => {
    if (debouncedSearch) setSearchSortCriteria(newCriteria);
    else setSortCriteria(newCriteria);
  };

  const updateSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Reset search sort criteria if search is cleared
  useEffect(() => {
    if (searchSortCriteria && !debouncedSearch) setSearchSortCriteria(undefined);
  }, [debouncedSearch, searchSortCriteria]);

  return {
    search,
    setSearch: updateSearch,
    debouncedSearch,
    sortCriteria: debouncedSearch ? searchSortCriteria : sortCriteria,
    setSortCriteria: updateSortCriteria,
  };
};

export default useTableSearchSortCriteria;
