import type React from 'react';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import type { FileSortCriteriaEnum } from '@/core/types/api/file';

const useTableSearchSortCriteria = (defaultSortCriteria: FileSortCriteriaEnum) => {
  const [sortCriteria, setSortCriteria] = useState<number>(defaultSortCriteria);
  const [searchSortCriteria, setSearchSortCriteria] = useState<number>();

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 250);

  const updateSortCriteria = (newCriteria: FileSortCriteriaEnum) => {
    if (debouncedSearch) setSearchSortCriteria(newCriteria);
    else setSortCriteria(newCriteria);
  };

  const updateSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
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
